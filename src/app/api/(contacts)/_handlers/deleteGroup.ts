import { AxiosError } from 'axios';
import { NextResponse } from 'next/server';

import { auth } from '@/auth';
import { getDataSource } from '@/database/data-source';

import { parseAndValidate } from '../../_utils/request';
import { deleteContactsNdp } from '../_services/deleteContacts';
import { deleteContactGroups } from '../_services/deleteGroup';
import { getContactGroupInfo } from '../_services/listContactGroups';
import { listGroupContacts } from '../_services/listGroupContacts';
import { deleteGroupPayloadValidate } from '../contact/group/delete/deleteGroup.validation';
import {
  IDeleteGroupPayload,
  IDeleteGroupResponse,
} from '../contact/group/delete/deleteGroup.types';

const PAGE_SIZE = 200;
const MAX_PAGES = 1000;
const DELETE_BATCH_SIZE = 200;
const DELETE_GROUP_ATTEMPTS = 3;
const DELETE_GROUP_RETRY_DELAY_MS = 250;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const isGroupExistsInProvider = async (groupId: number): Promise<boolean> => {
  try {
    const infoBody = (await getContactGroupInfo(groupId)).data;
    if (!infoBody?.success) {
      return false;
    }

    const providerGroupId = Number(infoBody.data?.id);
    return Number.isFinite(providerGroupId) && providerGroupId > 0;
  } catch (error) {
    if (error instanceof AxiosError && error.response?.status === 404) {
      return false;
    }

    throw error;
  }
};

const collectGroupContactIds = async (groupId: number): Promise<string[]> => {
  const ids = new Set<string>();
  let page = 1;
  let providerTotal = 0;

  while (page <= MAX_PAGES) {
    const providerResponse = await listGroupContacts({
      page,
      page_size: PAGE_SIZE,
      group_id: groupId,
    });
    const providerBody = providerResponse.data;

    if (!providerBody?.success) {
      throw new Error(providerBody?.msg ?? 'Failed to fetch group contacts');
    }

    const providerList = Array.isArray(providerBody.data?.list) ? providerBody.data.list : [];
    providerTotal = Number(providerBody.data?.total ?? providerTotal);

    providerList.forEach((contact) => {
      const contactId = Number(contact.id);
      if (!Number.isFinite(contactId) || contactId <= 0) return;
      ids.add(String(contactId));
    });

    if (providerList.length < PAGE_SIZE) break;
    if (providerTotal > 0 && ids.size >= providerTotal) break;
    page += 1;
  }

  return Array.from(ids);
};

const deleteGroupInProvider = async (
  groupId: number
): Promise<{ success: true } | { success: false; message: string }> => {
  for (let attempt = 1; attempt <= DELETE_GROUP_ATTEMPTS; attempt += 1) {
    const providerResponse = await deleteContactGroups([groupId]);
    const providerBody = providerResponse.data;

    if (!providerBody?.success) {
      return {
        success: false,
        message: providerBody?.msg ?? providerBody?.error ?? 'Failed to delete group',
      };
    }

    const failedCount = Number(providerBody.data?.failed_count ?? 0);
    if (failedCount > 0) {
      return {
        success: false,
        message: providerBody?.msg ?? 'Failed to delete group',
      };
    }

    const existsInProvider = await isGroupExistsInProvider(groupId);
    if (!existsInProvider) {
      return { success: true };
    }

    if (attempt < DELETE_GROUP_ATTEMPTS) {
      await sleep(DELETE_GROUP_RETRY_DELAY_MS);
    }
  }

  return {
    success: false,
    message: 'Group still exists in provider after delete',
  };
};

export async function POST(request: Request) {
  const parsedResult = await parseAndValidate<IDeleteGroupPayload>(
    request,
    deleteGroupPayloadValidate
  );

  if ('error' in parsedResult) {
    return parsedResult.error;
  }

  const parsed = parsedResult.data;

  const session = await auth();
  const accountId = session?.user?.id;
  if (!accountId) {
    return NextResponse.json<IDeleteGroupResponse>(
      { success: false, msg: 'Unauthorized' },
      { status: 401 }
    );
  }

  if (!process.env.BILLION_MAIL_API || !process.env.BILLION_MAIL_TOKEN) {
    return NextResponse.json<IDeleteGroupResponse>(
      { success: false, msg: 'Mail API is not configured', error: 'contact_group_delete_failed' },
      { status: 500 }
    );
  }

  try {
    const dataSource = await getDataSource();
    const rows = await dataSource.query(
      'SELECT 1 FROM account_recipient WHERE account_id = $1 AND group_id = $2 LIMIT 1',
      [accountId, parsed.group_id]
    );

    if ((rows as Array<unknown>).length === 0) {
      return NextResponse.json<IDeleteGroupResponse>(
        { success: false, msg: 'Group is not available', error: 'contact_group_access_denied' },
        { status: 403 }
      );
    }
  } catch {
    return NextResponse.json<IDeleteGroupResponse>(
      {
        success: false,
        msg: 'Failed to check group access',
        error: 'contact_group_delete_failed',
      },
      { status: 500 }
    );
  }

  try {
    const contactIds = await collectGroupContactIds(parsed.group_id);

    for (let offset = 0; offset < contactIds.length; offset += DELETE_BATCH_SIZE) {
      const batchIds = contactIds.slice(offset, offset + DELETE_BATCH_SIZE);
      const deleteContactsResponse = await deleteContactsNdp(batchIds);
      const deleteContactsBody = deleteContactsResponse.data;

      if (!deleteContactsBody?.success) {
        return NextResponse.json<IDeleteGroupResponse>(
          {
            success: false,
            msg: deleteContactsBody?.msg ?? 'Failed to delete group recipients',
            error: deleteContactsBody?.error ?? 'contact_group_delete_failed',
          },
          { status: 500 }
        );
      }
    }

    const deleteGroupResult = await deleteGroupInProvider(parsed.group_id);
    if (!deleteGroupResult.success) {
      return NextResponse.json<IDeleteGroupResponse>(
        {
          success: false,
          msg: deleteGroupResult.message,
          error: 'contact_group_delete_failed',
        },
        { status: 500 }
      );
    }
  } catch (error) {
    if (error instanceof AxiosError) {
      return NextResponse.json<IDeleteGroupResponse>(
        {
          success: false,
          msg: error.response?.data?.error ?? error.response?.data?.msg ?? 'Failed to delete group',
          error: 'contact_group_delete_failed',
        },
        { status: 500 }
      );
    }

    return NextResponse.json<IDeleteGroupResponse>(
      { success: false, msg: 'Failed to delete group', error: 'contact_group_delete_failed' },
      { status: 500 }
    );
  }

  try {
    const dataSource = await getDataSource();
    await dataSource.query(
      'DELETE FROM account_recipient WHERE account_id = $1 AND group_id = $2',
      [accountId, parsed.group_id]
    );
  } catch {
    return NextResponse.json<IDeleteGroupResponse>(
      { success: false, msg: 'Failed to delete local group', error: 'contact_group_delete_failed' },
      { status: 500 }
    );
  }

  const response: IDeleteGroupResponse = { success: true, msg: 'OK' };
  return NextResponse.json<IDeleteGroupResponse>(response);
}

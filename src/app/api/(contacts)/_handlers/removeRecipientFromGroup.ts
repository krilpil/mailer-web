import { AxiosError } from 'axios';
import { NextResponse } from 'next/server';

import { auth } from '@/auth';
import { getDataSource } from '@/database/data-source';

import { parseAndValidate } from '../../_utils/request';
import { deleteContactsByEmail } from '../_services/deleteContacts';
import { listGroupContacts } from '../_services/listGroupContacts';
import { updateContactsGroup } from '../_services/updateContactsGroup';
import {
  IRemoveRecipientFromGroupPayload,
  IRemoveRecipientFromGroupResponse,
  removeRecipientFromGroupPayloadValidate,
} from '../contact/group/recipient/remove';

export async function POST(request: Request) {
  const parsedResult = await parseAndValidate<IRemoveRecipientFromGroupPayload>(
    request,
    removeRecipientFromGroupPayloadValidate
  );

  if ('error' in parsedResult) {
    return parsedResult.error;
  }

  const parsed = parsedResult.data;
  const normalizedEmail = parsed.email.trim().toLowerCase();

  const session = await auth();
  const accountId = session?.user?.id;
  if (!accountId) {
    return NextResponse.json<IRemoveRecipientFromGroupResponse>(
      { success: false, msg: 'Unauthorized' },
      { status: 401 }
    );
  }

  if (!process.env.BILLION_MAIL_API || !process.env.BILLION_MAIL_TOKEN) {
    return NextResponse.json<IRemoveRecipientFromGroupResponse>(
      { success: false, msg: 'Mail API is not configured', error: 'contact_group_remove_failed' },
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
      return NextResponse.json<IRemoveRecipientFromGroupResponse>(
        { success: false, msg: 'Group is not available', error: 'contact_group_access_denied' },
        { status: 403 }
      );
    }
  } catch {
    return NextResponse.json<IRemoveRecipientFromGroupResponse>(
      {
        success: false,
        msg: 'Failed to check group access',
        error: 'contact_group_remove_failed',
      },
      { status: 500 }
    );
  }

  try {
    const providerResponse = await listGroupContacts({
      page: 1,
      page_size: 20,
      group_id: parsed.group_id,
      keyword: normalizedEmail,
    });
    const providerBody = providerResponse.data;

    if (!providerBody?.success) {
      return NextResponse.json<IRemoveRecipientFromGroupResponse>(
        {
          success: false,
          msg: providerBody?.msg ?? 'Failed to fetch recipient',
          error: providerBody?.error ?? 'contact_group_remove_failed',
        },
        { status: 500 }
      );
    }

    const targetContact = (providerBody.data?.list ?? []).find(
      (contact) => contact.email?.trim().toLowerCase() === normalizedEmail
    );

    if (!targetContact) {
      return NextResponse.json<IRemoveRecipientFromGroupResponse>(
        {
          success: false,
          msg: 'Recipient is not found in group',
          error: 'contact_group_remove_failed',
        },
        { status: 404 }
      );
    }

    const nextGroupIds = Array.from(
      new Set(
        (targetContact.groups ?? [])
          .map((group) => Number(group.id))
          .filter((groupId) => Number.isInteger(groupId) && groupId > 0)
      )
    ).filter((groupId) => groupId !== parsed.group_id);

    if (nextGroupIds.length === 0) {
      const deleteResponse = await deleteContactsByEmail([normalizedEmail], parsed.active);
      const deleteBody = deleteResponse.data;

      if (!deleteBody?.success) {
        return NextResponse.json<IRemoveRecipientFromGroupResponse>(
          {
            success: false,
            msg: deleteBody?.msg ?? 'Failed to remove recipient from group',
            error: deleteBody?.error ?? 'contact_group_remove_failed',
          },
          { status: 500 }
        );
      }
    } else {
      const updateResponse = await updateContactsGroup({
        emails: [normalizedEmail],
        status: parsed.active,
        group_ids: nextGroupIds,
      });
      const updateBody = updateResponse.data;

      if (!updateBody?.success) {
        return NextResponse.json<IRemoveRecipientFromGroupResponse>(
          {
            success: false,
            msg: updateBody?.msg ?? 'Failed to remove recipient from group',
            error: updateBody?.error ?? 'contact_group_remove_failed',
          },
          { status: 500 }
        );
      }
    }
  } catch (error) {
    if (error instanceof AxiosError) {
      return NextResponse.json<IRemoveRecipientFromGroupResponse>(
        {
          success: false,
          msg:
            error.response?.data?.error ??
            error.response?.data?.msg ??
            'Failed to remove recipient from group',
          error: 'contact_group_remove_failed',
        },
        { status: 500 }
      );
    }

    return NextResponse.json<IRemoveRecipientFromGroupResponse>(
      {
        success: false,
        msg: 'Failed to remove recipient from group',
        error: 'contact_group_remove_failed',
      },
      { status: 500 }
    );
  }

  return NextResponse.json<IRemoveRecipientFromGroupResponse>({
    success: true,
    msg: 'OK',
  });
}

import { createHash, randomUUID } from 'crypto';

import { AxiosError } from 'axios';
import { NextResponse } from 'next/server';

import { auth } from '@/auth';
import { getDataSource } from '@/database/data-source';

import { parseAndValidate } from '../../_utils/request';
import { createContactGroup } from '../_services/createGroup';
import { deleteContactGroups } from '../_services/deleteGroup';
import { getContactGroupInfo, listContactGroupsAll } from '../_services/listContactGroups';
import { createGroupPayloadValidate } from '../contact/group/create/createGroup.validation';
import {
  ICreateGroupPayload,
  ICreateGroupResponse,
} from '../contact/group/create/createGroup.types';

const MAX_GENERATE_ATTEMPTS = 10;
const MAX_GROUP_ID = 2_147_483_646;

const generateGroupId = (accountId: string, name: string): number => {
  const seed = `${accountId}:${name}:${randomUUID()}`;
  const digest = createHash('sha256').update(seed).digest('hex');
  const raw = Number.parseInt(digest.slice(0, 8), 16);
  const normalizedRaw = Number.isFinite(raw) ? raw : Math.floor(Math.random() * MAX_GROUP_ID);
  return (normalizedRaw % MAX_GROUP_ID) + 1;
};

const resolveCreatedGroupId = async (
  requestedGroupId: number,
  groupName: string
): Promise<number> => {
  try {
    const infoBody = (await getContactGroupInfo(requestedGroupId)).data;
    const infoGroupId = Number(infoBody?.data?.id);

    if (infoBody?.success && Number.isFinite(infoGroupId) && infoGroupId > 0) {
      return infoGroupId;
    }
  } catch {
    // Ignore and fallback to list-based resolution.
  }

  const listBody = (await listContactGroupsAll(groupName)).data;
  if (!listBody?.success) {
    throw new Error(listBody?.msg ?? 'Failed to resolve group id');
  }

  const matchedGroup = (listBody.data?.list ?? [])
    .filter(
      (group) =>
        typeof group.name === 'string' &&
        group.name.trim() === groupName &&
        Number.isFinite(Number(group.id)) &&
        Number(group.id) > 0
    )
    .sort((left, right) => Number(right.create_time ?? 0) - Number(left.create_time ?? 0))[0];

  if (!matchedGroup?.id) {
    throw new Error('Failed to resolve group id');
  }

  return Number(matchedGroup.id);
};

export async function POST(request: Request) {
  const parsedResult = await parseAndValidate<ICreateGroupPayload>(
    request,
    createGroupPayloadValidate
  );

  if ('error' in parsedResult) {
    return parsedResult.error;
  }

  const parsed = parsedResult.data;
  const normalizedName = parsed.name.trim();
  const normalizedDescription = parsed.description?.trim();

  const session = await auth();
  const accountId = session?.user?.id;
  if (!accountId) {
    return NextResponse.json<ICreateGroupResponse>(
      { success: false, msg: 'Unauthorized' },
      { status: 401 }
    );
  }

  if (!process.env.BILLION_MAIL_API || !process.env.BILLION_MAIL_TOKEN) {
    return NextResponse.json<ICreateGroupResponse>(
      { success: false, msg: 'Mail API is not configured', error: 'contact_group_create_failed' },
      { status: 500 }
    );
  }

  let generatedGroupId: number | null = null;

  try {
    const dataSource = await getDataSource();

    for (let attempt = 0; attempt < MAX_GENERATE_ATTEMPTS; attempt += 1) {
      const candidateGroupId = generateGroupId(accountId, normalizedName);
      const rows = await dataSource.query(
        'SELECT 1 FROM account_recipient WHERE account_id = $1 AND group_id = $2 LIMIT 1',
        [accountId, candidateGroupId]
      );

      if ((rows as Array<unknown>).length === 0) {
        generatedGroupId = candidateGroupId;
        break;
      }
    }
  } catch {
    return NextResponse.json<ICreateGroupResponse>(
      {
        success: false,
        msg: 'Failed to generate group id',
        error: 'contact_group_create_failed',
      },
      { status: 500 }
    );
  }

  if (!generatedGroupId) {
    return NextResponse.json<ICreateGroupResponse>(
      {
        success: false,
        msg: 'Failed to generate unique group id',
        error: 'contact_group_create_failed',
      },
      { status: 500 }
    );
  }

  let persistedGroupId: number;
  try {
    const providerResponse = await createContactGroup({
      group_id: generatedGroupId,
      name: normalizedName,
      description: normalizedDescription || undefined,
      create_type: 1,
      double_optin: parsed.double_optin ?? 0,
    });
    const providerBody = providerResponse.data;

    if (!providerBody?.success) {
      return NextResponse.json<ICreateGroupResponse>(
        {
          success: false,
          msg: providerBody?.msg ?? 'Failed to create group',
          error: providerBody?.error ?? 'contact_group_create_failed',
        },
        { status: 500 }
      );
    }

    persistedGroupId = await resolveCreatedGroupId(generatedGroupId, normalizedName);
  } catch (error) {
    if (error instanceof AxiosError) {
      return NextResponse.json<ICreateGroupResponse>(
        {
          success: false,
          msg: error.response?.data?.error ?? error.response?.data?.msg ?? 'Failed to create group',
          error: 'contact_group_create_failed',
        },
        { status: 500 }
      );
    }

    return NextResponse.json<ICreateGroupResponse>(
      { success: false, msg: 'Failed to create group', error: 'contact_group_create_failed' },
      { status: 500 }
    );
  }

  try {
    const dataSource = await getDataSource();
    await dataSource.query(
      `INSERT INTO account_recipient (account_id, group_id, name)
       VALUES ($1, $2, $3)`,
      [accountId, persistedGroupId, normalizedName]
    );
  } catch {
    try {
      await deleteContactGroups([persistedGroupId]);
    } catch {
      // Best-effort rollback only.
    }

    return NextResponse.json<ICreateGroupResponse>(
      { success: false, msg: 'Failed to save group', error: 'account_recipient_create_failed' },
      { status: 500 }
    );
  }

  const response: ICreateGroupResponse = {
    success: true,
    msg: 'OK',
    data: {
      group_id: persistedGroupId,
      name: normalizedName,
    },
  };

  return NextResponse.json<ICreateGroupResponse>(response);
}

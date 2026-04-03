import { AxiosError } from 'axios';
import { NextResponse } from 'next/server';

import { auth } from '@/auth';
import { getDataSource } from '@/database/data-source';

import { parseAndValidate } from '../../_utils/request';
import { importContactGroupRecipients } from '../_services/importContacts';
import { listContactGroupsAll } from '../_services/listContactGroups';
import { importContactsPayloadValidate } from '../contact/group/import/importContacts.validation';
import {
  IImportContactsPayload,
  IImportContactsResponse,
} from '../contact/group/import/importContacts.types';

const extractMissingGroupId = (message?: string): number | null => {
  if (!message) return null;
  const match = /group\s+(\d+)\s+does\s+not\s+exist/i.exec(message);
  if (!match) return null;

  const groupId = Number(match[1]);
  return Number.isFinite(groupId) && groupId > 0 ? groupId : null;
};

const resolveProviderGroupIdByName = async (groupName: string): Promise<number | null> => {
  const listBody = (await listContactGroupsAll(groupName)).data;
  if (!listBody?.success) return null;

  const matchedGroup = (listBody.data?.list ?? [])
    .filter(
      (group) =>
        typeof group.name === 'string' &&
        group.name.trim() === groupName &&
        Number.isFinite(Number(group.id)) &&
        Number(group.id) > 0
    )
    .sort((left, right) => Number(right.create_time ?? 0) - Number(left.create_time ?? 0))[0];

  if (!matchedGroup?.id) return null;
  return Number(matchedGroup.id);
};

export async function POST(request: Request) {
  const parsedResult = await parseAndValidate<IImportContactsPayload>(
    request,
    importContactsPayloadValidate
  );

  if ('error' in parsedResult) {
    return parsedResult.error;
  }

  const parsed = parsedResult.data;

  const session = await auth();
  const accountId = session?.user?.id;
  if (!accountId) {
    return NextResponse.json<IImportContactsResponse>(
      { success: false, msg: 'Требуется авторизация' },
      { status: 401 }
    );
  }

  if (!process.env.BILLION_MAIL_API || !process.env.BILLION_MAIL_TOKEN) {
    return NextResponse.json<IImportContactsResponse>(
      { success: false, msg: 'Почтовый API не настроен', error: 'contact_group_import_failed' },
      { status: 500 }
    );
  }

  const groupIds = Array.from(new Set(parsed.group_ids));
  const recipients = Array.from(
    new Set(
      (parsed.recipients ?? []).map((recipient) => recipient.trim().toLowerCase()).filter(Boolean)
    )
  );
  const fileData = parsed.file_data?.trim();
  const hasRecipients = recipients.length > 0;
  const hasFileData = Boolean(fileData);

  if (!hasRecipients && !hasFileData) {
    return NextResponse.json<IImportContactsResponse>(
      {
        success: false,
        msg: 'Список пользователей пуст',
        error: 'contact_group_import_failed',
      },
      { status: 400 }
    );
  }

  try {
    const dataSource = await getDataSource();
    const placeholders = groupIds.map((_, index) => `$${index + 2}`).join(', ');
    const rows = await dataSource.query(
      `SELECT group_id
       FROM account_recipient
       WHERE account_id = $1
         AND group_id IN (${placeholders})`,
      [accountId, ...groupIds]
    );
    const groupIdsFromDb = new Set(
      (rows as Array<{ group_id?: number | string }>)
        .map((row) => Number(row.group_id))
        .filter((groupId) => Number.isInteger(groupId) && groupId > 0)
    );

    if (groupIdsFromDb.size !== groupIds.length) {
      return NextResponse.json<IImportContactsResponse>(
        {
          success: false,
          msg: 'Некоторые группы недоступны',
          error: 'contact_group_access_denied',
        },
        { status: 403 }
      );
    }
  } catch {
    return NextResponse.json<IImportContactsResponse>(
      {
        success: false,
        msg: 'Не удалось проверить доступ к группам',
        error: 'contact_group_import_failed',
      },
      { status: 500 }
    );
  }

  try {
    const importPayloadBase = {
      default_active: parsed.default_active ?? 1,
      status: 1 as const,
      overwrite: parsed.overwrite ?? 0,
    };
    const buildImportPayload = (ids: number[]) =>
      hasFileData
        ? {
            ...importPayloadBase,
            group_ids: ids,
            file_type: parsed.file_type ?? ('txt' as const),
            file_data: fileData as string,
            import_type: 1 as const,
          }
        : {
            ...importPayloadBase,
            group_ids: ids,
            contacts: recipients.join('\n'),
            import_type: 2 as const,
          };

    const importPayload = buildImportPayload(groupIds);

    const providerResponse = await importContactGroupRecipients(importPayload);
    const providerBody = providerResponse.data;

    if (!providerBody?.success) {
      const missingGroupId = extractMissingGroupId(providerBody?.msg);
      if (missingGroupId && groupIds.includes(missingGroupId)) {
        const dataSource = await getDataSource();
        const localGroupRows = await dataSource.query(
          'SELECT group_id, name FROM account_recipient WHERE account_id = $1 AND group_id = $2 LIMIT 1',
          [accountId, missingGroupId]
        );
        const localGroup = (localGroupRows as Array<{ name?: string }>)[0];
        const groupName = localGroup?.name?.trim();

        if (groupName) {
          const resolvedGroupId = await resolveProviderGroupIdByName(groupName);

          if (resolvedGroupId && resolvedGroupId !== missingGroupId) {
            const recoveredGroupIds = groupIds.map((groupId) =>
              groupId === missingGroupId ? resolvedGroupId : groupId
            );

            await dataSource
              .query(
                'UPDATE account_recipient SET group_id = $1 WHERE account_id = $2 AND group_id = $3',
                [resolvedGroupId, accountId, missingGroupId]
              )
              .catch(() => {
                // Ignore local update issue and still retry with resolved provider id.
              });

            const retryResponse = await importContactGroupRecipients({
              ...buildImportPayload(Array.from(new Set(recoveredGroupIds))),
            });
            const retryBody = retryResponse.data;

            if (retryBody?.success) {
              return NextResponse.json<IImportContactsResponse>({
                success: true,
                msg: 'Успешно',
                data: {
                  imported_count:
                    typeof retryBody.data?.imported_count === 'number'
                      ? retryBody.data.imported_count
                      : hasRecipients
                        ? recipients.length
                        : 0,
                },
              });
            }
          }
        }
      }

      return NextResponse.json<IImportContactsResponse>(
        {
          success: false,
          msg: 'Не удалось импортировать пользователей',
          error: 'contact_group_import_failed',
        },
        { status: 500 }
      );
    }

    return NextResponse.json<IImportContactsResponse>({
      success: true,
      msg: 'Успешно',
      data: {
        imported_count:
          typeof providerBody.data?.imported_count === 'number'
            ? providerBody.data.imported_count
            : hasRecipients
              ? recipients.length
              : 0,
      },
    });
  } catch (error) {
    if (error instanceof AxiosError) {
      return NextResponse.json<IImportContactsResponse>(
        {
          success: false,
          msg: 'Не удалось импортировать пользователей',
          error: 'contact_group_import_failed',
        },
        { status: 500 }
      );
    }

    return NextResponse.json<IImportContactsResponse>(
      {
        success: false,
        msg: 'Не удалось импортировать пользователей',
        error: 'contact_group_import_failed',
      },
      { status: 500 }
    );
  }
}

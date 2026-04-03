import { NextResponse } from 'next/server';

import { auth } from '@/auth';
import { getDataSource } from '@/database/data-source';

import { IListGroupsResponse } from '../contact/group/list/listGroups.types';
import { listContactGroups } from '../_services/listContactGroups';

export async function GET() {
  const emptyData: IListGroupsResponse['data'] = { total: 0, list: [] };

  const session = await auth();
  const accountId = session?.user?.id;
  if (!accountId) {
    return NextResponse.json<IListGroupsResponse>(
      { success: false, msg: 'Требуется авторизация', data: emptyData },
      { status: 401 }
    );
  }

  try {
    const dataSource = await getDataSource();
    const rows = await dataSource.query(
      `SELECT group_id, name
       FROM account_recipient
       WHERE account_id = $1
       ORDER BY group_id DESC`,
      [accountId]
    );

    const list = (rows as Array<{ group_id?: number | string; name?: string }>).reduce<
      Array<{ group_id: number; name: string; recipients_count: number }>
    >((acc, row) => {
      const groupId = Number(row.group_id);
      const name = row.name?.trim();
      if (!name || !Number.isFinite(groupId)) return acc;

      acc.push({ group_id: groupId, name, recipients_count: 0 });
      return acc;
    }, []);

    if (list.length === 0) {
      return NextResponse.json<IListGroupsResponse>({
        success: true,
        msg: 'Успешно',
        data: {
          total: 0,
          list: [],
        },
      });
    }

    if (process.env.BILLION_MAIL_API && process.env.BILLION_MAIL_TOKEN) {
      const recipientsCountByGroupId = new Map<number, number>();
      const unresolvedGroupIds = new Set(list.map((item) => item.group_id));

      const pageSize = 100;
      let page = 1;
      let total = Number.POSITIVE_INFINITY;

      while (unresolvedGroupIds.size > 0 && (page - 1) * pageSize < total) {
        const providerResponse = await listContactGroups({
          page,
          page_size: pageSize,
        });
        const providerBody = providerResponse.data;

        if (!providerBody?.success) {
          break;
        }

        const providerList = providerBody.data?.list ?? [];
        total = Number(providerBody.data?.total ?? 0);

        for (const providerGroup of providerList) {
          const groupId = Number(providerGroup.id);
          if (!Number.isInteger(groupId) || !unresolvedGroupIds.has(groupId)) {
            continue;
          }

          const recipientsCount = Number(providerGroup.total_count ?? 0);
          recipientsCountByGroupId.set(
            groupId,
            Number.isFinite(recipientsCount) ? recipientsCount : 0
          );
          unresolvedGroupIds.delete(groupId);
        }

        if (providerList.length === 0) {
          break;
        }

        page += 1;
      }

      for (const item of list) {
        item.recipients_count = recipientsCountByGroupId.get(item.group_id) ?? 0;
      }
    }

    return NextResponse.json<IListGroupsResponse>({
      success: true,
      msg: 'Успешно',
      data: {
        total: list.length,
        list,
      },
    });
  } catch {
    return NextResponse.json<IListGroupsResponse>(
      { success: false, msg: 'Не удалось получить список групп', data: emptyData },
      { status: 500 }
    );
  }
}

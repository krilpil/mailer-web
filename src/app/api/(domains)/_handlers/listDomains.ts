import { AxiosError } from 'axios';
import { NextResponse } from 'next/server';
import { number } from 'yup';

import { auth } from '@/auth';
import { getDataSource } from '@/database/data-source';
import { IListResponse } from '@/app/api/(domains)/domains/list/list.types';
import { fetchDomainsList } from '@/app/api/(domains)/_services/listDomains';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const page = await number().required().validate(searchParams.get('page'), { abortEarly: true });
  const emptyList = { total: 0, list: [] };

  const session = await auth();
  const accountId = session?.user?.id;
  if (!accountId) {
    return NextResponse.json<IListResponse>(
      { success: false, msg: 'Unauthorized', data: emptyList },
      { status: 401 }
    );
  }

  let allowedDomains: Set<string>;
  try {
    const dataSource = await getDataSource();
    const rows = await dataSource.query(
      'SELECT domain FROM account_domain WHERE account_id = $1',
      [accountId]
    );
    allowedDomains = new Set(
      (rows as Array<{ domain?: string }>)
        .map((row) => row.domain)
        .filter((domain): domain is string => Boolean(domain))
        .map((domain) => domain.toLowerCase())
    );
  } catch {
    return NextResponse.json<IListResponse>(
      { success: false, msg: 'Failed to fetch account domains', data: emptyList },
      { status: 500 }
    );
  }

  if (allowedDomains.size === 0) {
    return NextResponse.json<IListResponse>({ success: true, msg: 'OK', data: emptyList });
  }

  return fetchDomainsList(page)
    .then((body) => {
      if (!body?.success) {
        return NextResponse.json<IListResponse>(
          { success: body.success, msg: body.msg, data: emptyList },
          { status: 500 }
        );
      }

      const filteredList = body.data.list.filter((item) =>
        allowedDomains.has(item.domain.toLowerCase())
      );

      return NextResponse.json<IListResponse>({
        success: true,
        msg: body.msg,
        data: {
          total: filteredList.length,
          list: filteredList,
        },
      });
    })
    .catch((error) => {
      if (error instanceof AxiosError) {
        return NextResponse.json<IListResponse>(
          { msg: error.response?.data?.error, success: false, data: emptyList },
          { status: 500 }
        );
      }

      return NextResponse.json<IListResponse>(
        { msg: 'An unhandled error', success: false, data: emptyList },
        { status: 500 }
      );
    });
}

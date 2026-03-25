import { AxiosError } from 'axios';
import { NextResponse } from 'next/server';

import { auth } from '@/auth';
import { getDataSource } from '@/database/data-source';
import { fetchDomainMailboxes } from '@/app/api/(domains)/_services/listMailboxes';
import { IListMailboxesResponse } from '../mailbox/all/list.types';

export async function GET() {
  const emptyList = { total: 0, list: [] };

  const session = await auth();
  const accountId = session?.user?.id;
  if (!accountId) {
    return NextResponse.json<IListMailboxesResponse>(
      { success: false, msg: 'Unauthorized', data: emptyList },
      { status: 401 }
    );
  }

  let domains: string[];
  try {
    const dataSource = await getDataSource();
    const rows = await dataSource.query(
      'SELECT domain FROM account_domain WHERE account_id = $1',
      [accountId]
    );
    const rawDomains = (rows as Array<{ domain?: string }>)
      .map((row) => row.domain)
      .filter((domain): domain is string => Boolean(domain))
      .map((domain) => domain.toLowerCase());
    domains = Array.from(new Set(rawDomains));
  } catch {
    return NextResponse.json<IListMailboxesResponse>(
      { success: false, msg: 'Failed to fetch account domains', data: emptyList },
      { status: 500 }
    );
  }

  if (domains.length === 0) {
    return NextResponse.json<IListMailboxesResponse>({
      success: true,
      msg: 'OK',
      data: emptyList,
    });
  }

  try {
    const responses = await Promise.all(domains.map((domain) => fetchDomainMailboxes(domain)));
    const mailboxMap = new Map<string, { username: string; create_time: number }>();

    responses.forEach((response) => {
      const body = response.data;
      if (!body?.success) {
        throw new Error(body?.msg ?? 'Failed to fetch mailboxes');
      }

      (body.data ?? []).forEach((mailbox) => {
        if (!mailbox?.username) return;
        if (mailboxMap.has(mailbox.username)) return;

        mailboxMap.set(mailbox.username, {
          username: mailbox.username,
          create_time:
            typeof mailbox.create_time === 'number'
              ? mailbox.create_time
              : Number(mailbox.create_time ?? 0),
        });
      });
    });

    const list = Array.from(mailboxMap.values());

    return NextResponse.json<IListMailboxesResponse>({
      success: true,
      msg: 'OK',
      data: {
        total: list.length,
        list,
      },
    });
  } catch (error) {
    if (error instanceof AxiosError) {
      return NextResponse.json<IListMailboxesResponse>(
        {
          success: false,
          msg: error.response?.data?.error ?? 'Failed to fetch mailboxes',
          data: emptyList,
        },
        { status: 500 }
      );
    }

    const message = error instanceof Error ? error.message : 'Failed to fetch mailboxes';
    return NextResponse.json<IListMailboxesResponse>(
      { success: false, msg: message, data: emptyList },
      { status: 500 }
    );
  }
}

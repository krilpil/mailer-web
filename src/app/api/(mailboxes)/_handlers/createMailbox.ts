import { randomBytes } from 'crypto';
import { AxiosError } from 'axios';
import { NextResponse } from 'next/server';

import { auth } from '@/auth';
import { getDataSource } from '@/database/data-source';
import { parseAndValidate } from '@/app/api/_utils/request';

import { createMailboxPayloadValidate } from '../mailbox/create/createMailbox.validation';
import {
  ICreateMailboxPayload,
  ICreateMailboxResponse,
} from '../mailbox/create/createMailbox.types';
import { createMailbox } from '../_services/createMailbox';
import { verifyMailboxOtp } from '../_services/verifyMailboxOtp';

export async function POST(request: Request) {
  const parsedResult = await parseAndValidate<ICreateMailboxPayload>(
    request,
    createMailboxPayloadValidate
  );

  if ('error' in parsedResult) {
    return parsedResult.error;
  }

  const parsed = parsedResult.data;

  const session = await auth();
  const accountId = session?.user?.id;
  if (!accountId) {
    return NextResponse.json<ICreateMailboxResponse>(
      { success: false, msg: 'Требуется авторизация' },
      { status: 401 }
    );
  }

  if (parsed.local_part.includes('@')) {
    return NextResponse.json<ICreateMailboxResponse>(
      {
        success: false,
        msg: 'Некорректная часть адреса до символа @',
        error: 'mailbox_create_failed',
      },
      { status: 400 }
    );
  }

  const normalizedDomain = parsed.domain.toLowerCase();
  const email = `${parsed.local_part}@${normalizedDomain}`;

  try {
    const dataSource = await getDataSource();
    const rows = await dataSource.query(
      'SELECT 1 FROM account_domain WHERE account_id = $1 AND domain = $2 LIMIT 1',
      [accountId, normalizedDomain]
    );

    if ((rows as Array<unknown>).length === 0) {
      return NextResponse.json<ICreateMailboxResponse>(
        { success: false, msg: 'Домен недоступен', error: 'domain_access_denied' },
        { status: 403 }
      );
    }
  } catch {
    return NextResponse.json<ICreateMailboxResponse>(
      { success: false, msg: 'Не удалось проверить доступ к домену', error: 'domain_access_failed' },
      { status: 500 }
    );
  }

  let otpResult: Awaited<ReturnType<typeof verifyMailboxOtp>>;
  try {
    otpResult = await verifyMailboxOtp({
      otpGuid: parsed.otp_guid,
      email,
      otpCode: parsed.otp,
    });
  } catch {
    return NextResponse.json<ICreateMailboxResponse>(
      { success: false, msg: 'Не удалось подтвердить код', error: 'mailbox_create_failed' },
      { status: 500 }
    );
  }

  if (otpResult.status === 'otp_not_found') {
    return NextResponse.json<ICreateMailboxResponse>(
      {
        success: false,
        msg: 'Код подтверждения не найден или истек',
        error: 'mailbox_create_failed',
      },
      { status: 404 }
    );
  }

  if (!process.env.BILLION_MAIL_API || !process.env.BILLION_MAIL_TOKEN) {
    return NextResponse.json<ICreateMailboxResponse>(
      { success: false, msg: 'Почтовый API не настроен', error: 'mailbox_create_failed' },
      { status: 500 }
    );
  }

  const password = randomBytes(16).toString('hex');

  try {
    const mailboxResponse = await createMailbox({
      domain: normalizedDomain,
      local_part: parsed.local_part,
      password,
      isAdmin: 0,
      active: 1,
    });
    const mailboxBody = mailboxResponse.data;

    if (mailboxBody?.success === false) {
      return NextResponse.json<ICreateMailboxResponse>(
        {
          success: false,
          msg: 'Не удалось создать почтовый ящик',
          error: 'mailbox_create_failed',
        },
        { status: 500 }
      );
    }
  } catch (error) {
    if (error instanceof AxiosError) {
      return NextResponse.json<ICreateMailboxResponse>(
        {
          success: false,
          msg: 'Не удалось создать почтовый ящик',
          error: 'mailbox_create_failed',
        },
        { status: 500 }
      );
    }

    return NextResponse.json<ICreateMailboxResponse>(
      {
        success: false,
        msg: 'Не удалось создать почтовый ящик',
        error: 'mailbox_create_failed',
      },
      { status: 500 }
    );
  }

  try {
    const dataSource = await getDataSource();
    await dataSource.query(
      `INSERT INTO account_mailbox (account_id, username, domain, local_part)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (username) DO NOTHING`,
      [accountId, email, normalizedDomain, parsed.local_part]
    );
  } catch {
    return NextResponse.json<ICreateMailboxResponse>(
      {
        success: false,
        msg: 'Не удалось сохранить почтовый ящик',
        error: 'account_mailbox_create_failed',
      },
      { status: 500 }
    );
  }

  const response: ICreateMailboxResponse = { success: true, msg: 'Успешно' };
  return NextResponse.json<ICreateMailboxResponse>(response);
}

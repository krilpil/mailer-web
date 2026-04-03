import { AxiosError } from 'axios';
import { NextResponse } from 'next/server';

import { auth } from '@/auth';
import { getDataSource } from '@/database/data-source';
import { parseAndValidate } from '@/app/api/_utils/request';

import { deleteMailboxPayloadValidate } from '../mailbox/delete/deleteMailbox.validation';
import {
  IDeleteMailboxPayload,
  IDeleteMailboxResponse,
} from '../mailbox/delete/deleteMailbox.types';
import { deleteMailbox } from '../_services/deleteMailbox';

export async function POST(request: Request) {
  const parsedResult = await parseAndValidate<IDeleteMailboxPayload>(
    request,
    deleteMailboxPayloadValidate
  );

  if ('error' in parsedResult) {
    return parsedResult.error;
  }

  const parsed = parsedResult.data;

  const session = await auth();
  const accountId = session?.user?.id;
  if (!accountId) {
    return NextResponse.json<IDeleteMailboxResponse>(
      { success: false, msg: 'Требуется авторизация' },
      { status: 401 }
    );
  }

  const atIndex = parsed.username.lastIndexOf('@');
  if (atIndex <= 0 || atIndex === parsed.username.length - 1) {
    return NextResponse.json<IDeleteMailboxResponse>(
      {
        success: false,
        msg: 'Некорректный адрес почтового ящика',
        error: 'mailbox_delete_failed',
      },
      { status: 400 }
    );
  }

  const localPart = parsed.username.slice(0, atIndex);
  const domain = parsed.username.slice(atIndex + 1).toLowerCase();
  const normalizedUsername = `${localPart}@${domain}`;

  if (!process.env.BILLION_MAIL_API || !process.env.BILLION_MAIL_TOKEN) {
    return NextResponse.json<IDeleteMailboxResponse>(
      { success: false, msg: 'Почтовый API не настроен', error: 'mailbox_delete_failed' },
      { status: 500 }
    );
  }

  try {
    const dataSource = await getDataSource();
    const mailboxRows = await dataSource.query(
      'SELECT 1 FROM account_mailbox WHERE account_id = $1 AND username = $2 LIMIT 1',
      [accountId, normalizedUsername]
    );

    if ((mailboxRows as Array<unknown>).length === 0) {
      const domainRows = await dataSource.query(
        'SELECT 1 FROM account_domain WHERE account_id = $1 AND domain = $2 LIMIT 1',
        [accountId, domain]
      );

      if ((domainRows as Array<unknown>).length === 0) {
        return NextResponse.json<IDeleteMailboxResponse>(
          { success: false, msg: 'Почтовый ящик недоступен', error: 'mailbox_access_denied' },
          { status: 403 }
        );
      }
    }
  } catch {
    return NextResponse.json<IDeleteMailboxResponse>(
      {
        success: false,
        msg: 'Не удалось проверить доступ к почтовому ящику',
        error: 'mailbox_delete_failed',
      },
      { status: 500 }
    );
  }

  try {
    const deleteResponse = await deleteMailbox([normalizedUsername]);
    const deleteBody = deleteResponse.data;

    if (!deleteBody?.success) {
      return NextResponse.json<IDeleteMailboxResponse>(
        {
          success: false,
          msg: 'Не удалось удалить почтовый ящик',
          error: 'mailbox_delete_failed',
        },
        { status: 500 }
      );
    }
  } catch (error) {
    if (error instanceof AxiosError) {
      return NextResponse.json<IDeleteMailboxResponse>(
        {
          success: false,
          msg: 'Не удалось удалить почтовый ящик',
          error: 'mailbox_delete_failed',
        },
        { status: 500 }
      );
    }

    return NextResponse.json<IDeleteMailboxResponse>(
      {
        success: false,
        msg: 'Не удалось удалить почтовый ящик',
        error: 'mailbox_delete_failed',
      },
      { status: 500 }
    );
  }

  try {
    const dataSource = await getDataSource();
    await dataSource.query(
      'DELETE FROM account_mailbox WHERE account_id = $1 AND username = $2',
      [accountId, normalizedUsername]
    );
  } catch {
    // Best-effort cleanup only.
  }

  const response: IDeleteMailboxResponse = { success: true, msg: 'Успешно' };
  return NextResponse.json<IDeleteMailboxResponse>(response);
}

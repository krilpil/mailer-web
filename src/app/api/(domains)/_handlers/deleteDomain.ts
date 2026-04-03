import { AxiosError } from 'axios';
import { NextResponse } from 'next/server';

import { parseAndValidate } from '@/app/api/_utils/request';

import { deleteDomainPayloadValidate } from '../domains/delete/deleteDomain.validation';
import {
  IDeleteDomainPayload,
  IDeleteDomainResponse,
} from '../domains/delete/deleteDomain.types';
import { deleteDomain } from '../_services/deleteDomain';
import { deleteMailboxes } from '../_services/deleteMailboxes';
import { fetchDomainMailboxes } from '../_services/listMailboxes';

export async function POST(request: Request) {
  const parsedResult = await parseAndValidate<IDeleteDomainPayload>(
    request,
    deleteDomainPayloadValidate
  );

  if ('error' in parsedResult) {
    return parsedResult.error;
  }

  const parsed = parsedResult.data;

  if (!process.env.BILLION_MAIL_API || !process.env.BILLION_MAIL_TOKEN) {
    return NextResponse.json(
      { success: false, msg: 'Почтовый API не настроен', error: 'domain_delete_failed' },
      { status: 500 }
    );
  }

  let mailboxEmails: string[] = [];

  try {
    const listResponse = await fetchDomainMailboxes(parsed.domain);
    const listBody = listResponse.data;
    const mailboxList = Array.isArray(listBody?.data) ? listBody.data : [];
    const errorMessage = `${listBody?.error ?? ''} ${listBody?.msg ?? ''}`.toLowerCase();
    const isEmptyMailbox =
      mailboxList.length === 0 &&
      (errorMessage.includes('not found') ||
        errorMessage.includes('no mailbox') ||
        errorMessage.includes('not exist') ||
        errorMessage.includes('empty'));

    if (!listBody?.success && !isEmptyMailbox) {
      return NextResponse.json(
        {
          success: false,
          msg: 'Не удалось получить список почтовых ящиков',
          error: 'mailbox_list_failed',
        },
        { status: 500 }
      );
    }

    mailboxEmails = mailboxList
      .map((mailbox) => mailbox.username)
      .filter((value): value is string => Boolean(value));
  } catch (error) {
    if (error instanceof AxiosError) {
      return NextResponse.json(
        {
          success: false,
          msg: 'Не удалось получить список почтовых ящиков',
          error: 'mailbox_list_failed',
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        msg: 'Не удалось получить список почтовых ящиков',
        error: 'mailbox_list_failed',
      },
      { status: 500 }
    );
  }

  if (mailboxEmails.length > 0) {
    try {
      const deleteResponse = await deleteMailboxes(mailboxEmails);
      const deleteBody = deleteResponse.data;

      if (!deleteBody?.success) {
        return NextResponse.json(
          {
            success: false,
            msg: 'Не удалось удалить почтовые ящики',
            error: 'mailbox_delete_failed',
          },
          { status: 500 }
        );
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        return NextResponse.json(
          {
            success: false,
            msg: 'Не удалось удалить почтовые ящики',
            error: 'mailbox_delete_failed',
          },
          { status: 500 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          msg: 'Не удалось удалить почтовые ящики',
          error: 'mailbox_delete_failed',
        },
        { status: 500 }
      );
    }
  }

  try {
    const deleteResponse = await deleteDomain({ domain: parsed.domain });
    const deleteBody = deleteResponse.data;

    if (!deleteBody?.success) {
      return NextResponse.json(
        {
          success: false,
          msg: 'Не удалось удалить домен',
          error: 'domain_delete_failed',
        },
        { status: 500 }
      );
    }
  } catch (error) {
    if (error instanceof AxiosError) {
      return NextResponse.json(
        {
          success: false,
          msg: 'Не удалось удалить домен',
          error: 'domain_delete_failed',
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: false, msg: 'Не удалось удалить домен', error: 'domain_delete_failed' },
      { status: 500 }
    );
  }

  const response: IDeleteDomainResponse = { success: true, msg: 'Успешно' };
  return NextResponse.json<IDeleteDomainResponse>(response);
}

import { AxiosError } from 'axios';
import { NextResponse } from 'next/server';

import { auth } from '@/auth';
import { getDataSource } from '@/database/data-source';

import { parseAndValidate } from '../../_utils/request';
import { deleteEmailTemplate } from '../_services/deleteEmailTemplate';
import { deleteUserTemplatePayloadValidate } from '../email_template/delete/deleteTemplate.validation';
import {
  IDeleteUserTemplatePayload,
  IDeleteUserTemplateResponse,
} from '../email_template/delete/deleteTemplate.types';

interface IProviderErrorPayload {
  msg?: string;
  error?: string;
  code?: number;
}

const buildErrorResponse = (
  msg: string,
  status = 500,
  error = 'email_template_delete_failed',
  code?: number
) =>
  NextResponse.json<IDeleteUserTemplateResponse>({ success: false, msg, error, code }, { status });

const toProviderErrorPayload = (error: AxiosError): IProviderErrorPayload | undefined => {
  if (!error.response?.data || typeof error.response.data !== 'object') {
    return undefined;
  }

  return error.response.data as IProviderErrorPayload;
};

const isTemplateMissingError = (message?: string): boolean => {
  if (!message) return false;
  return /not\s+exist/i.test(message);
};

export async function POST(request: Request) {
  const parsedResult = await parseAndValidate<IDeleteUserTemplatePayload>(
    request,
    deleteUserTemplatePayloadValidate
  );

  if ('error' in parsedResult) {
    return parsedResult.error;
  }

  const session = await auth();
  const accountId = session?.user?.id;
  if (!accountId) {
    return buildErrorResponse('Требуется авторизация', 401, 'email_template_access_denied');
  }

  if (!process.env.BILLION_MAIL_API || !process.env.BILLION_MAIL_TOKEN) {
    return buildErrorResponse('Почтовый API не настроен');
  }

  const templateId = parsedResult.data.template_id;

  try {
    const dataSource = await getDataSource();
    const ownershipRows = await dataSource.query(
      'SELECT 1 FROM account_template WHERE account_id = $1 AND template_id = $2 LIMIT 1',
      [accountId, templateId]
    );

    if ((ownershipRows as Array<unknown>).length === 0) {
      return buildErrorResponse('Шаблон недоступен', 403, 'email_template_access_denied');
    }
  } catch {
    return buildErrorResponse(
      'Не удалось проверить доступ к шаблону',
      500,
      'email_template_delete_failed'
    );
  }

  let shouldDeleteLocal = false;

  try {
    const providerResponse = await deleteEmailTemplate({ id: templateId });
    const providerBody = providerResponse.data;

    if (providerBody?.success) {
      shouldDeleteLocal = true;
    } else {
      const providerMessage = providerBody?.error ?? providerBody?.msg;

      if (isTemplateMissingError(providerMessage)) {
        shouldDeleteLocal = true;
      } else {
        return buildErrorResponse(
          'Не удалось удалить шаблон',
          500,
          'email_template_delete_failed',
          providerBody?.code
        );
      }
    }
  } catch (error) {
    if (error instanceof AxiosError) {
      const providerError = toProviderErrorPayload(error);
      const providerMessage = providerError?.error ?? providerError?.msg;

      if (isTemplateMissingError(providerMessage)) {
        shouldDeleteLocal = true;
      } else {
        return buildErrorResponse(
          'Не удалось удалить шаблон',
          500,
          'email_template_delete_failed',
          providerError?.code
        );
      }
    } else {
      return buildErrorResponse('Не удалось удалить шаблон');
    }
  }

  if (shouldDeleteLocal) {
    try {
      const dataSource = await getDataSource();
      await dataSource.query(
        'DELETE FROM account_template WHERE account_id = $1 AND template_id = $2',
        [accountId, templateId]
      );
    } catch {
      return buildErrorResponse(
        'Не удалось удалить шаблон в локальной базе',
        500,
        'email_template_delete_failed'
      );
    }
  }

  return NextResponse.json<IDeleteUserTemplateResponse>({ success: true, msg: 'Успешно' });
}

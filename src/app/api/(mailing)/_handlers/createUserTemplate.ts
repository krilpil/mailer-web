import { render } from '@react-email/render';
import { AxiosError } from 'axios';
import { NextResponse } from 'next/server';

import { auth } from '@/auth';
import { getDataSource } from '@/database/data-source';
import { EmailTemplate } from '@/entities/mailer/ui/EmailTemplate/EmailTemplate';

import { parseAndValidate } from '../../_utils/request';
import { createEmailTemplate } from '../_services/createEmailTemplate';
import { deleteEmailTemplate } from '../_services/deleteEmailTemplate';
import { createTemplatePayloadValidate } from '../email_template/create/createTemplate.validation';
import {
  ICreateTemplatePayload,
  ICreateTemplateResponse,
} from '../email_template/create/createTemplate.types';

interface IProviderErrorPayload {
  msg?: string;
  error?: string;
  code?: number;
}

const buildErrorResponse = (
  msg: string,
  status = 500,
  error = 'email_template_create_failed',
  code?: number
) => NextResponse.json<ICreateTemplateResponse>({ success: false, msg, error, code }, { status });

const toProviderErrorPayload = (error: AxiosError): IProviderErrorPayload | undefined => {
  if (!error.response?.data || typeof error.response.data !== 'object') {
    return undefined;
  }

  return error.response.data as IProviderErrorPayload;
};

const toProviderCode = (value: unknown): number | undefined => {
  const code = Number(value);
  return Number.isFinite(code) ? code : undefined;
};

const toPositiveInteger = (value: unknown): number | null => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

const extractTemplateId = (value: unknown): number | null => {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const body = value as {
    id?: unknown;
    template_id?: unknown;
    data?: {
      id?: unknown;
      template_id?: unknown;
    };
  };

  return (
    toPositiveInteger(body.data?.id) ??
    toPositiveInteger(body.data?.template_id) ??
    toPositiveInteger(body.id) ??
    toPositiveInteger(body.template_id)
  );
};

export async function POST(request: Request) {
  const parsedResult = await parseAndValidate<ICreateTemplatePayload>(
    request,
    createTemplatePayloadValidate
  );

  if ('error' in parsedResult) {
    return parsedResult.error;
  }

  const session = await auth();
  const accountId = session?.user?.id;
  if (!accountId) {
    return buildErrorResponse('Unauthorized', 401, 'email_template_access_denied');
  }

  if (!process.env.BILLION_MAIL_API || !process.env.BILLION_MAIL_TOKEN) {
    return buildErrorResponse('Mail API is not configured');
  }

  const templateName = parsedResult.data.template_name.trim();
  const serializedTemplate = JSON.stringify(parsedResult.data.content);

  let createdTemplateId: number | null = null;
  let isRollbackAttempted = false;

  const rollbackTemplateCreation = async (): Promise<void> => {
    if (!createdTemplateId || isRollbackAttempted) {
      return;
    }

    isRollbackAttempted = true;

    try {
      await deleteEmailTemplate({ id: createdTemplateId });
    } catch {
      // Best-effort rollback.
    }
  };

  try {
    const htmlContent = await render(
      EmailTemplate({
        title: templateName,
        content: parsedResult.data.content,
      })
    );

    const providerResponse = await createEmailTemplate({
      temp_name: templateName,
      add_type: 0,
      html_content: htmlContent,
    });
    const providerBody = providerResponse.data;
    const providerCode = toProviderCode(providerBody?.code);

    if (!providerBody?.success) {
      return buildErrorResponse(
        providerBody?.msg ?? 'Failed to create template',
        500,
        providerBody?.error ?? 'email_template_create_failed',
        providerCode
      );
    }

    createdTemplateId = extractTemplateId(providerBody);
    if (!createdTemplateId) {
      return buildErrorResponse(
        'Template id was not returned',
        500,
        'email_template_create_failed',
        providerCode
      );
    }

    try {
      const dataSource = await getDataSource();
      await dataSource.query(
        `INSERT INTO account_template (account_id, template_id, template_name, template)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (account_id, template_id)
         DO UPDATE SET
           template_name = EXCLUDED.template_name,
           template = EXCLUDED.template,
           updated_at = NOW()`,
        [accountId, createdTemplateId, templateName, serializedTemplate]
      );
    } catch {
      await rollbackTemplateCreation();

      return buildErrorResponse(
        'Failed to save template',
        500,
        'account_template_create_failed',
        providerCode
      );
    }

    return NextResponse.json<ICreateTemplateResponse>({
      success: true,
      msg: providerBody.msg ?? 'OK',
      code: providerCode,
      data: {
        template_id: createdTemplateId,
        template_name: templateName,
      },
    });
  } catch (error) {
    await rollbackTemplateCreation();

    if (error instanceof AxiosError) {
      const providerError = toProviderErrorPayload(error);

      return buildErrorResponse(
        providerError?.error ?? providerError?.msg ?? 'Failed to create template',
        500,
        providerError?.error ?? 'email_template_create_failed',
        toProviderCode(providerError?.code)
      );
    }

    return buildErrorResponse('Failed to create template');
  }
}

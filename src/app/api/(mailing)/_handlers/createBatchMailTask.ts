import { AxiosError } from 'axios';
import { NextResponse } from 'next/server';

import { parseAndValidate } from '../../_utils/request';
import { createBatchMailTask } from '../_services/createBatchMailTask';
import { createBatchMailTaskPayloadValidate } from '../batch_mail/task/create/createTask.validation';
import {
  ICreateBatchMailTaskPayload,
  ICreateBatchMailTaskResponse,
} from '../batch_mail/task/create/createTask.types';

interface IProviderErrorPayload {
  msg?: string;
  error?: string;
  code?: number;
}

const buildErrorResponse = (
  msg: string,
  error = 'batch_mail_task_create_failed',
  code?: number,
  status = 500
) =>
  NextResponse.json<ICreateBatchMailTaskResponse>({ success: false, msg, error, code }, { status });

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

export async function POST(request: Request) {
  const parsedResult = await parseAndValidate<ICreateBatchMailTaskPayload>(
    request,
    createBatchMailTaskPayloadValidate
  );

  if ('error' in parsedResult) {
    return parsedResult.error;
  }

  if (!process.env.BILLION_MAIL_API || !process.env.BILLION_MAIL_TOKEN) {
    return buildErrorResponse('Почтовый API не настроен');
  }

  const parsedPayload = parsedResult.data;

  try {
    const taskPayload = {
      addresser: parsedPayload.addresser,
      subject: parsedPayload.subject,
      template_id: parsedPayload.template_id,
      group_id: parsedPayload.group_id,
      start_time: parsedPayload.start_time,
      full_name: parsedPayload.full_name,
      is_record: parsedPayload.is_record,
      unsubscribe: parsedPayload.unsubscribe,
      threads: parsedPayload.threads,
      track_open: parsedPayload.track_open,
      track_click: parsedPayload.track_click,
      warmup: parsedPayload.warmup,
      remark: parsedPayload.remark,
      tag_ids: parsedPayload.tag_ids,
      tag_logic: parsedPayload.tag_logic,
    };

    const providerBody = (await createBatchMailTask(taskPayload)).data;
    const providerCode = toProviderCode(providerBody?.code);

    if (!providerBody?.success) {
      return buildErrorResponse(
        'Не удалось создать задачу',
        'batch_mail_task_create_failed',
        providerCode
      );
    }

    const taskId = toPositiveInteger(providerBody.data?.id);
    if (!taskId) {
      return buildErrorResponse(
        'Сервис не вернул идентификатор задачи',
        'batch_mail_task_create_failed',
        providerCode
      );
    }

    return NextResponse.json<ICreateBatchMailTaskResponse>({
      success: true,
      msg: 'Успешно',
      code: providerCode,
      data: {
        id: taskId,
      },
    });
  } catch (error) {
    if (error instanceof AxiosError) {
      const providerError = toProviderErrorPayload(error);

      return buildErrorResponse(
        'Не удалось создать задачу',
        'batch_mail_task_create_failed',
        toProviderCode(providerError?.code)
      );
    }

    return buildErrorResponse('Не удалось создать задачу');
  }
}

import { AxiosError } from 'axios';
import { NextResponse } from 'next/server';
import { ValidationError } from 'yup';

import { listBatchMailTasks } from '../_services/listBatchMailTasks';
import { listBatchMailTasksQueryValidate } from '../batch_mail/task/list/listTasks.validation';
import {
  IBatchMailGroupInfo,
  IBatchMailTagInfo,
  IBatchMailTask,
  IListBatchMailTasksQuery,
  IListBatchMailTasksResponse,
} from '../batch_mail/task/list/listTasks.types';

const emptyData: IListBatchMailTasksResponse['data'] = { total: 0, list: [] };

const toNumber = (value: unknown, fallback = 0): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toString = (value: unknown): string => (typeof value === 'string' ? value : '');

const normalizeTag = (value: unknown): IBatchMailTagInfo | null => {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const source = value as Record<string, unknown>;
  const id = toNumber(source.id);

  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }

  return {
    id,
    name: toString(source.name),
    create_time: toNumber(source.create_time),
  };
};

const normalizeGroup = (value: unknown): IBatchMailGroupInfo | null => {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const source = value as Record<string, unknown>;
  const id = toNumber(source.id);

  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }

  return {
    id,
    name: toString(source.name),
    description: toString(source.description),
    count: toNumber(source.count),
  };
};

const normalizeTask = (value: unknown): IBatchMailTask | null => {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const source = value as Record<string, unknown>;
  const id = toNumber(source.id);

  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }

  const tags = Array.isArray(source.tags)
    ? source.tags
        .map((item) => normalizeTag(item))
        .filter((item): item is IBatchMailTagInfo => item !== null)
    : [];

  return {
    id,
    task_name: toString(source.task_name),
    addresser: toString(source.addresser),
    subject: toString(source.subject),
    full_name: toString(source.full_name),
    recipient_count: toNumber(source.recipient_count),
    task_process: toNumber(source.task_process),
    pause: toNumber(source.pause),
    template_id: toNumber(source.template_id),
    is_record: toNumber(source.is_record),
    unsubscribe: toNumber(source.unsubscribe),
    threads: toNumber(source.threads),
    track_open: toNumber(source.track_open),
    track_click: toNumber(source.track_click),
    start_time: toNumber(source.start_time),
    create_time: toNumber(source.create_time),
    update_time: toNumber(source.update_time),
    remark: toString(source.remark),
    active: toNumber(source.active),
    add_type: toNumber(source.add_type),
    estimated_time_with_warmup: toNumber(source.estimated_time_with_warmup),
    group_id: toNumber(source.group_id),
    group_name: toString(source.group_name),
    use_tag_filter: toNumber(source.use_tag_filter),
    tag_logic: toString(source.tag_logic),
    sent_count: toNumber(source.sent_count),
    unsent_count: toNumber(source.unsent_count),
    progress: toNumber(source.progress),
    template_name: toString(source.template_name),
    success_count: toNumber(source.success_count),
    error_count: toNumber(source.error_count),
    deferred: toNumber(source.deferred),
    tags,
    groups: normalizeGroup(source.groups),
  };
};

const buildErrorResponse = (
  msg: string,
  status = 500,
  error = 'batch_mail_task_list_failed',
  code?: number
) =>
  NextResponse.json<IListBatchMailTasksResponse>(
    {
      success: false,
      msg,
      error,
      code,
      data: emptyData,
    },
    { status }
  );

const parseQuery = async (
  request: Request
): Promise<
  { data: IListBatchMailTasksQuery } | { error: NextResponse<IListBatchMailTasksResponse> }
> => {
  const { searchParams } = new URL(request.url);

  const rawPayload: Partial<Record<keyof IListBatchMailTasksQuery, string>> = {
    page: searchParams.get('page') ?? undefined,
    page_size: searchParams.get('page_size') ?? undefined,
    keyword: searchParams.get('keyword') ?? undefined,
    status: searchParams.get('status') ?? undefined,
  };

  try {
    const data = await listBatchMailTasksQueryValidate.validate(rawPayload, {
      abortEarly: false,
      stripUnknown: true,
    });

    return { data };
  } catch (error) {
    if (error instanceof ValidationError) {
      const message = error.errors.length ? error.errors.join(', ') : 'Validation error';
      return {
        error: buildErrorResponse(message, 400, 'batch_mail_task_list_invalid_query'),
      };
    }

    return {
      error: buildErrorResponse('Validation error', 400, 'batch_mail_task_list_invalid_query'),
    };
  }
};

export async function GET(request: Request) {
  const queryResult = await parseQuery(request);

  if ('error' in queryResult) {
    return queryResult.error;
  }

  if (!process.env.BILLION_MAIL_API || !process.env.BILLION_MAIL_TOKEN) {
    return buildErrorResponse('Mail API is not configured');
  }

  try {
    const providerBody = (await listBatchMailTasks(queryResult.data)).data;
    const providerCode =
      typeof providerBody?.code === 'number' && Number.isFinite(providerBody.code)
        ? providerBody.code
        : undefined;

    if (!providerBody?.success) {
      return buildErrorResponse(
        providerBody?.msg ?? 'Failed to fetch task list',
        500,
        providerBody?.error ?? 'batch_mail_task_list_failed',
        providerCode
      );
    }

    const list = Array.isArray(providerBody.data?.list)
      ? providerBody.data.list
          .map((item) => normalizeTask(item))
          .filter((item): item is IBatchMailTask => item !== null)
      : [];

    const total = toNumber(providerBody.data?.total, list.length);

    return NextResponse.json<IListBatchMailTasksResponse>({
      success: true,
      msg: providerBody.msg ?? 'OK',
      code: providerCode,
      data: {
        total,
        list,
      },
    });
  } catch (error) {
    if (error instanceof AxiosError) {
      const providerError =
        error.response?.data && typeof error.response.data === 'object'
          ? (error.response.data as { msg?: string; error?: string; code?: number })
          : undefined;

      return buildErrorResponse(
        providerError?.error ?? providerError?.msg ?? 'Failed to fetch task list',
        500,
        providerError?.error ?? 'batch_mail_task_list_failed',
        providerError?.code
      );
    }

    return buildErrorResponse('Failed to fetch task list');
  }
}

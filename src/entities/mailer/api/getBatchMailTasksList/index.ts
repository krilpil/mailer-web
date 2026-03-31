import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { API, DetailsError } from '@/shared/api';

import {
  BatchMailTaskType,
  IGetBatchMailTasksListPayload,
  IGetBatchMailTasksListResponse,
} from './getBatchMailTasksList.types';

export const getBatchMailTasksListKey = 'getBatchMailTasksList';

const toNumber = (value: unknown, fallback = 0): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toString = (value: unknown): string => (typeof value === 'string' ? value : '');

const toTask = (value: unknown): BatchMailTaskType | null => {
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
        .map((tag) => {
          if (!tag || typeof tag !== 'object') return null;
          const rawTag = tag as Record<string, unknown>;
          const tagId = toNumber(rawTag.id);
          if (!Number.isInteger(tagId) || tagId <= 0) return null;

          return {
            id: tagId,
            name: toString(rawTag.name),
            create_time: toNumber(rawTag.create_time),
          };
        })
        .filter(
          (
            tag
          ): tag is {
            id: number;
            name: string;
            create_time: number;
          } => tag !== null
        )
    : [];

  const groups =
    source.groups && typeof source.groups === 'object'
      ? {
          id: toNumber((source.groups as Record<string, unknown>).id),
          name: toString((source.groups as Record<string, unknown>).name),
          description: toString((source.groups as Record<string, unknown>).description),
          count: toNumber((source.groups as Record<string, unknown>).count),
        }
      : null;

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
    groups,
  };
};

const normalizeResponse = (raw: unknown): IGetBatchMailTasksListResponse => {
  const source = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  const sourceData =
    source.data && typeof source.data === 'object' ? (source.data as Record<string, unknown>) : {};
  const rawList = Array.isArray(sourceData.list) ? sourceData.list : [];

  const list = rawList
    .map((item) => toTask(item))
    .filter((item): item is BatchMailTaskType => !!item);

  return {
    success: source.success === true,
    msg: toString(source.msg) || 'OK',
    code: typeof source.code === 'number' && Number.isFinite(source.code) ? source.code : undefined,
    error: typeof source.error === 'string' ? source.error : undefined,
    data: {
      total: toNumber(sourceData.total, list.length),
      list,
    },
  };
};

export const getBatchMailTasksList = async (
  payload: IGetBatchMailTasksListPayload
): Promise<IGetBatchMailTasksListResponse> => {
  return API<IGetBatchMailTasksListResponse>({
    url: '/api/batch_mail/task/list',
    method: 'GET',
    params: {
      page: payload.page,
      page_size: payload.page_size,
      keyword: payload.keyword,
      status: payload.status,
    },
  })
    .then(({ data }) => normalizeResponse(data))
    .catch((error: AxiosError) => {
      const errorName = 'mailer/getBatchMailTasksList';

      throw new DetailsError(errorName, { status: error.response?.status });
    });
};

export const useGetBatchMailTasksList = (payload: IGetBatchMailTasksListPayload) =>
  useQuery({
    queryKey: [getBatchMailTasksListKey, payload],
    queryFn: () => getBatchMailTasksList(payload),
    select: (data) => data.data,
    enabled: payload.page > 0 && payload.page_size > 0,
  });

export * from './getBatchMailTasksList.types';

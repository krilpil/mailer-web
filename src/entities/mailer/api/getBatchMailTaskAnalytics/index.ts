import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { API, DetailsError } from '@/shared/api';

import {
  BatchMailTaskAnalyticsLogType,
  BatchMailTaskAnalyticsType,
  IGetBatchMailTaskAnalyticsPayload,
  IGetBatchMailTaskAnalyticsResponse,
} from './getBatchMailTaskAnalytics.types';

export const getBatchMailTaskAnalyticsKey = 'getBatchMailTaskAnalytics';

const toNumber = (value: unknown, fallback = 0): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toString = (value: unknown): string => (typeof value === 'string' ? value : '');

const toObject = (value: unknown): Record<string, unknown> | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
};

const toLogItem = (value: unknown): BatchMailTaskAnalyticsLogType | null => {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const source = value as Record<string, unknown>;

  return {
    postfix_message_id: toString(source.postfix_message_id),
    status: toString(source.status),
    recipient: toString(source.recipient),
    mail_provider: toString(source.mail_provider),
    delay: toNumber(source.delay),
    delays: toString(source.delays),
    dsn: toString(source.dsn),
    relay: toString(source.relay),
    description: toString(source.description),
    log_time: toNumber(source.log_time),
  };
};

const normalizeData = (value: unknown): BatchMailTaskAnalyticsType => {
  const source = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  const period = toObject(source.period);
  const statChartSource = toObject(source.stat_chart);
  const logsSource = toObject(source.logs);
  const rawLogList = Array.isArray(logsSource?.list) ? logsSource?.list : [];
  const warnings = Array.isArray(source.warnings)
    ? source.warnings.map((item) => toString(item)).filter((item) => !!item)
    : [];

  const logsList = rawLogList
    .map((item) => toLogItem(item))
    .filter((item): item is BatchMailTaskAnalyticsLogType => item !== null);

  return {
    task_id: toNumber(source.task_id),
    period: {
      start_time: toNumber(period?.start_time),
      end_time: toNumber(period?.end_time),
    },
    stat_chart: statChartSource
      ? {
          dashboard: toObject(statChartSource.dashboard) ?? {},
          mail_providers: statChartSource.mail_providers ?? null,
          send_mail_chart: statChartSource.send_mail_chart ?? null,
          bounce_rate_chart: statChartSource.bounce_rate_chart ?? null,
          open_rate_chart: statChartSource.open_rate_chart ?? null,
          click_rate_chart: statChartSource.click_rate_chart ?? null,
        }
      : null,
    mail_provider: source.mail_provider ?? null,
    logs: {
      total: toNumber(logsSource?.total, logsList.length),
      page: toNumber(logsSource?.page, 1),
      page_size: toNumber(logsSource?.page_size, 20),
      list: logsList,
    },
    warnings,
  };
};

const normalizeResponse = (raw: unknown): IGetBatchMailTaskAnalyticsResponse => {
  const source = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};

  return {
    success: source.success === true,
    msg: toString(source.msg) || 'OK',
    code: typeof source.code === 'number' && Number.isFinite(source.code) ? source.code : undefined,
    error: typeof source.error === 'string' ? source.error : undefined,
    data: normalizeData(source.data),
  };
};

export const getBatchMailTaskAnalytics = async (
  payload: IGetBatchMailTaskAnalyticsPayload
): Promise<IGetBatchMailTaskAnalyticsResponse> => {
  return API<IGetBatchMailTaskAnalyticsResponse>({
    url: '/api/batch_mail/task/analytics',
    method: 'GET',
    params: {
      task_id: payload.task_id,
      start_time: payload.start_time,
      end_time: payload.end_time,
      logs_status: payload.logs_status,
      logs_domain: payload.logs_domain,
      logs_page: payload.logs_page,
      logs_page_size: payload.logs_page_size,
    },
  })
    .then(({ data }) => normalizeResponse(data))
    .catch((error: AxiosError) => {
      const errorName = 'mailer/getBatchMailTaskAnalytics';

      throw new DetailsError(errorName, { status: error.response?.status });
    });
};

export const useGetBatchMailTaskAnalytics = (payload: IGetBatchMailTaskAnalyticsPayload) =>
  useQuery({
    queryKey: [getBatchMailTaskAnalyticsKey, payload],
    queryFn: () => getBatchMailTaskAnalytics(payload),
    select: (data) => data.data,
    enabled: payload.task_id > 0,
  });

export * from './getBatchMailTaskAnalytics.types';

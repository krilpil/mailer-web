import { AxiosError } from 'axios';
import { NextResponse } from 'next/server';
import { ValidationError } from 'yup';

import {
  getBatchMailTaskLogs,
  type IProviderBatchMailTaskLogItem,
} from '../_services/getBatchMailTaskLogs';
import { getBatchMailTaskMailProviderStat } from '../_services/getBatchMailTaskMailProviderStat';
import { getBatchMailTaskStatChart } from '../_services/getBatchMailTaskStatChart';
import { getBatchMailTaskAnalyticsQueryValidate } from '../batch_mail/task/analytics/analytics.validation';
import {
  IBatchMailTaskAnalyticsLogItem,
  IGetBatchMailTaskAnalyticsQuery,
  IGetBatchMailTaskAnalyticsResponse,
} from '../batch_mail/task/analytics/analytics.types';

interface IProviderErrorPayload {
  msg?: string;
  error?: string;
  code?: number;
}

const DEFAULT_LOGS_PAGE = 1;
const DEFAULT_LOGS_PAGE_SIZE = 20;
const DAY_IN_SECONDS = 86_400;

const buildErrorResponse = (
  msg: string,
  status = 500,
  error = 'batch_mail_task_analytics_failed',
  code?: number
) =>
  NextResponse.json<IGetBatchMailTaskAnalyticsResponse>(
    {
      success: false,
      msg,
      error,
      code,
      data: {
        task_id: 0,
        period: { start_time: 0, end_time: 0 },
        stat_chart: null,
        mail_provider: null,
        logs: {
          total: 0,
          page: DEFAULT_LOGS_PAGE,
          page_size: DEFAULT_LOGS_PAGE_SIZE,
          list: [],
        },
        warnings: [],
      },
    },
    { status }
  );

const toNumber = (value: unknown, fallback = 0): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toString = (value: unknown): string => (typeof value === 'string' ? value : '');

const toProviderCode = (value: unknown): number | undefined => {
  const code = Number(value);
  return Number.isFinite(code) ? code : undefined;
};

const toObject = (value: unknown): Record<string, unknown> | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
};

const normalizeLogItem = (
  value: IProviderBatchMailTaskLogItem
): IBatchMailTaskAnalyticsLogItem => ({
  postfix_message_id: toString(value.postfix_message_id),
  status: toString(value.status),
  recipient: toString(value.recipient),
  mail_provider: toString(value.mail_provider),
  delay: toNumber(value.delay),
  delays: toString(value.delays),
  dsn: toString(value.dsn),
  relay: toString(value.relay),
  description: toString(value.description),
  log_time: toNumber(value.log_time),
});

const normalizeWarning = (prefix: string, error: unknown): string => {
  if (error instanceof AxiosError) {
    const providerError =
      error.response?.data && typeof error.response.data === 'object'
        ? (error.response.data as IProviderErrorPayload)
        : undefined;

    return `${prefix}: ${providerError?.msg ?? providerError?.error ?? 'provider request failed'}`;
  }

  return `${prefix}: request failed`;
};

const parseQuery = async (
  request: Request
): Promise<
  | { data: IGetBatchMailTaskAnalyticsQuery }
  | { error: NextResponse<IGetBatchMailTaskAnalyticsResponse> }
> => {
  const { searchParams } = new URL(request.url);

  const rawPayload: Partial<Record<keyof IGetBatchMailTaskAnalyticsQuery, string>> = {
    task_id: searchParams.get('task_id') ?? undefined,
    start_time: searchParams.get('start_time') ?? undefined,
    end_time: searchParams.get('end_time') ?? undefined,
    logs_status: searchParams.get('logs_status') ?? undefined,
    logs_domain: searchParams.get('logs_domain') ?? undefined,
    logs_page: searchParams.get('logs_page') ?? undefined,
    logs_page_size: searchParams.get('logs_page_size') ?? undefined,
  };

  try {
    const data = await getBatchMailTaskAnalyticsQueryValidate.validate(rawPayload, {
      abortEarly: false,
      stripUnknown: true,
    });

    return { data };
  } catch (error) {
    if (error instanceof ValidationError) {
      const message = error.errors.length ? error.errors.join(', ') : 'Validation error';
      return {
        error: buildErrorResponse(message, 400, 'batch_mail_task_analytics_invalid_query'),
      };
    }

    return {
      error: buildErrorResponse('Validation error', 400, 'batch_mail_task_analytics_invalid_query'),
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

  const now = Math.floor(Date.now() / 1000);
  const requestedStart = queryResult.data.start_time ?? now - DAY_IN_SECONDS;
  const requestedEnd = queryResult.data.end_time ?? now;
  const startTime = requestedStart > 0 ? requestedStart : now - DAY_IN_SECONDS;
  const endTime = requestedEnd >= startTime ? requestedEnd : startTime;
  const logsPage = queryResult.data.logs_page ?? DEFAULT_LOGS_PAGE;
  const logsPageSize = queryResult.data.logs_page_size ?? DEFAULT_LOGS_PAGE_SIZE;

  const [statChartResult, mailProviderResult, logsResult] = await Promise.allSettled([
    getBatchMailTaskStatChart({
      task_id: queryResult.data.task_id,
      start_time: startTime,
      end_time: endTime,
      domain: queryResult.data.logs_domain,
    }),
    getBatchMailTaskMailProviderStat({
      task_id: queryResult.data.task_id,
      status: queryResult.data.logs_status,
    }),
    getBatchMailTaskLogs({
      task_id: queryResult.data.task_id,
      status: queryResult.data.logs_status,
      domain: queryResult.data.logs_domain,
      page: logsPage,
      page_size: logsPageSize,
    }),
  ]);

  const warnings: string[] = [];
  let statChart: IGetBatchMailTaskAnalyticsResponse['data']['stat_chart'] = null;
  let mailProvider: unknown = null;
  let logs: IGetBatchMailTaskAnalyticsResponse['data']['logs'] = {
    total: 0,
    page: logsPage,
    page_size: logsPageSize,
    list: [],
  };
  let firstProviderCode: number | undefined;
  let firstProviderError = '';

  if (statChartResult.status === 'fulfilled') {
    const body = statChartResult.value.data;
    const code = toProviderCode(body?.code);

    if (typeof firstProviderCode === 'undefined' && typeof code === 'number') {
      firstProviderCode = code;
    }

    if (!body?.success) {
      warnings.push(`Графики аналитики: ${body?.msg ?? 'provider request failed'}`);
      firstProviderError = firstProviderError || (body?.msg ?? 'provider request failed');
    } else {
      const data = toObject(body.data);
      statChart = {
        dashboard: toObject(data?.dashboard) ?? {},
        mail_providers: data?.mail_providers ?? null,
        send_mail_chart: data?.send_mail_chart ?? null,
        bounce_rate_chart: data?.bounce_rate_chart ?? null,
        open_rate_chart: data?.open_rate_chart ?? null,
        click_rate_chart: data?.click_rate_chart ?? null,
      };
    }
  } else {
    warnings.push(normalizeWarning('Графики аналитики', statChartResult.reason));
  }

  if (mailProviderResult.status === 'fulfilled') {
    const body = mailProviderResult.value.data;
    const code = toProviderCode(body?.code);

    if (typeof firstProviderCode === 'undefined' && typeof code === 'number') {
      firstProviderCode = code;
    }

    if (!body?.success) {
      warnings.push(`Статистика провайдеров: ${body?.msg ?? 'provider request failed'}`);
      firstProviderError = firstProviderError || (body?.msg ?? 'provider request failed');
    } else {
      mailProvider = body.data ?? null;
    }
  } else {
    warnings.push(normalizeWarning('Статистика провайдеров', mailProviderResult.reason));
  }

  if (logsResult.status === 'fulfilled') {
    const body = logsResult.value.data;
    const code = toProviderCode(body?.code);

    if (typeof firstProviderCode === 'undefined' && typeof code === 'number') {
      firstProviderCode = code;
    }

    if (!body?.success) {
      warnings.push(`Логи отправки: ${body?.msg ?? 'provider request failed'}`);
      firstProviderError = firstProviderError || (body?.msg ?? 'provider request failed');
    } else {
      const list = Array.isArray(body.data?.list)
        ? body.data?.list.map((item) => normalizeLogItem(item))
        : [];

      logs = {
        total: toNumber(body.data?.total, list.length),
        page: logsPage,
        page_size: logsPageSize,
        list,
      };
    }
  } else {
    warnings.push(normalizeWarning('Логи отправки', logsResult.reason));
  }

  if (!statChart && !mailProvider && logs.list.length === 0 && warnings.length > 0) {
    return buildErrorResponse(
      firstProviderError || 'Не удалось получить аналитику задачи',
      500,
      'batch_mail_task_analytics_failed',
      firstProviderCode
    );
  }

  return NextResponse.json<IGetBatchMailTaskAnalyticsResponse>({
    success: true,
    msg: warnings.length ? 'Часть аналитики недоступна' : 'OK',
    code: firstProviderCode,
    data: {
      task_id: queryResult.data.task_id,
      period: {
        start_time: startTime,
        end_time: endTime,
      },
      stat_chart: statChart,
      mail_provider: mailProvider,
      logs,
      warnings,
    },
  });
}

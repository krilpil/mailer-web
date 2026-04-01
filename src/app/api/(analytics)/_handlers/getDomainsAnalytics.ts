import { NextResponse } from 'next/server';
import { ValidationError } from 'yup';

import { auth } from '@/auth';

import {
  buildAccountAnalyticsSource,
  buildDomainsAnalytics,
} from '../_services/buildAccountAnalyticsSource';
import { getDomainsAnalyticsQueryValidate } from '../analytics/domains/domains.validation';
import {
  IGetDomainsAnalyticsQuery,
  IGetDomainsAnalyticsResponse,
} from '../analytics/domains/domains.types';

const DEFAULT_PERIOD_SECONDS = 30 * 86_400;

const buildErrorResponse = (
  msg: string,
  status = 500,
  error = 'domains_analytics_failed',
  code?: number
) =>
  NextResponse.json<IGetDomainsAnalyticsResponse>(
    {
      success: false,
      msg,
      error,
      code,
      data: null,
    },
    { status }
  );

const parseQuery = async (
  request: Request
): Promise<
  { data: IGetDomainsAnalyticsQuery } | { error: NextResponse<IGetDomainsAnalyticsResponse> }
> => {
  const { searchParams } = new URL(request.url);

  const payload: Partial<Record<keyof IGetDomainsAnalyticsQuery, string>> = {
    account_id: searchParams.get('account_id') ?? undefined,
    start_time: searchParams.get('start_time') ?? undefined,
    end_time: searchParams.get('end_time') ?? undefined,
    domains: searchParams.get('domains') ?? undefined,
  };

  try {
    const data = await getDomainsAnalyticsQueryValidate.validate(payload, {
      abortEarly: false,
      stripUnknown: true,
    });

    return { data };
  } catch (error) {
    if (error instanceof ValidationError) {
      const message = error.errors.length ? error.errors.join(', ') : 'Validation error';
      return {
        error: buildErrorResponse(message, 400, 'domains_analytics_invalid_query'),
      };
    }

    return {
      error: buildErrorResponse('Validation error', 400, 'domains_analytics_invalid_query'),
    };
  }
};

export async function GET(request: Request) {
  const queryResult = await parseQuery(request);

  if ('error' in queryResult) {
    return queryResult.error;
  }

  const session = await auth();
  const accountId = session?.user?.id;

  if (!accountId) {
    return buildErrorResponse('Unauthorized', 401, 'unauthorized');
  }

  if (queryResult.data.account_id && queryResult.data.account_id !== accountId) {
    return buildErrorResponse(
      'Access denied for requested account_id',
      403,
      'account_access_denied'
    );
  }

  if (!process.env.BILLION_MAIL_API || !process.env.BILLION_MAIL_TOKEN) {
    return buildErrorResponse('Mail API is not configured');
  }

  const now = Math.floor(Date.now() / 1000);
  const requestedStart = queryResult.data.start_time ?? now - DEFAULT_PERIOD_SECONDS;
  const requestedEnd = queryResult.data.end_time ?? now;
  const startTime = requestedStart > 0 ? requestedStart : now - DEFAULT_PERIOD_SECONDS;
  const endTime = requestedEnd >= startTime ? requestedEnd : startTime;

  const requestedDomains =
    typeof queryResult.data.domains === 'string' && queryResult.data.domains.trim().length > 0
      ? queryResult.data.domains
          .split(',')
          .map((domain) => domain.trim().toLowerCase())
          .filter((domain) => !!domain)
      : undefined;

  try {
    const source = await buildAccountAnalyticsSource({
      account_id: accountId,
      period: {
        start_time: startTime,
        end_time: endTime,
      },
      include_overview: true,
    });

    const data = buildDomainsAnalytics(source, requestedDomains);

    return NextResponse.json<IGetDomainsAnalyticsResponse>({
      success: true,
      msg: data.warnings.length ? 'Часть аналитики недоступна' : 'OK',
      data,
    });
  } catch (error) {
    if (error instanceof Error) {
      return buildErrorResponse(error.message || 'Failed to build domain analytics');
    }

    return buildErrorResponse('Failed to build domain analytics');
  }
}

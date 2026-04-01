import { NextResponse } from 'next/server';
import { ValidationError } from 'yup';

import { auth } from '@/auth';

import {
  buildAccountAnalyticsSource,
  buildMailboxesAnalytics,
} from '../_services/buildAccountAnalyticsSource';
import { getMailboxesAnalyticsQueryValidate } from '../analytics/mailboxes/mailboxes.validation';
import {
  IGetMailboxesAnalyticsQuery,
  IGetMailboxesAnalyticsResponse,
} from '../analytics/mailboxes/mailboxes.types';

const DEFAULT_PERIOD_SECONDS = 30 * 86_400;

const buildErrorResponse = (
  msg: string,
  status = 500,
  error = 'mailboxes_analytics_failed',
  code?: number
) =>
  NextResponse.json<IGetMailboxesAnalyticsResponse>(
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
  { data: IGetMailboxesAnalyticsQuery } | { error: NextResponse<IGetMailboxesAnalyticsResponse> }
> => {
  const { searchParams } = new URL(request.url);

  const payload: Partial<Record<keyof IGetMailboxesAnalyticsQuery, string>> = {
    account_id: searchParams.get('account_id') ?? undefined,
    start_time: searchParams.get('start_time') ?? undefined,
    end_time: searchParams.get('end_time') ?? undefined,
    mailboxes: searchParams.get('mailboxes') ?? undefined,
  };

  try {
    const data = await getMailboxesAnalyticsQueryValidate.validate(payload, {
      abortEarly: false,
      stripUnknown: true,
    });

    return { data };
  } catch (error) {
    if (error instanceof ValidationError) {
      const message = error.errors.length ? error.errors.join(', ') : 'Validation error';
      return {
        error: buildErrorResponse(message, 400, 'mailboxes_analytics_invalid_query'),
      };
    }

    return {
      error: buildErrorResponse('Validation error', 400, 'mailboxes_analytics_invalid_query'),
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

  const requestedMailboxes =
    typeof queryResult.data.mailboxes === 'string' && queryResult.data.mailboxes.trim().length > 0
      ? queryResult.data.mailboxes
          .split(',')
          .map((mailbox) => mailbox.trim().toLowerCase())
          .filter((mailbox) => !!mailbox)
      : undefined;

  try {
    const source = await buildAccountAnalyticsSource({
      account_id: accountId,
      period: {
        start_time: startTime,
        end_time: endTime,
      },
      include_overview: false,
    });

    const data = buildMailboxesAnalytics(source, requestedMailboxes);

    return NextResponse.json<IGetMailboxesAnalyticsResponse>({
      success: true,
      msg: data.warnings.length ? 'Часть аналитики недоступна' : 'OK',
      data,
    });
  } catch (error) {
    if (error instanceof Error) {
      return buildErrorResponse(error.message || 'Failed to build mailbox analytics');
    }

    return buildErrorResponse('Failed to build mailbox analytics');
  }
}

import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { API, DetailsError } from '@/shared/api';

import {
  IGetMailboxesAnalyticsPayload,
  IGetMailboxesAnalyticsResponse,
  MailboxesAnalyticsData,
} from './getMailboxesAnalytics.types';

export const getMailboxesAnalyticsKey = 'getMailboxesAnalytics';

const toString = (value: unknown): string => (typeof value === 'string' ? value : '');

const toNumberOrUndefined = (value: unknown): number | undefined => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const normalizeResponse = (raw: unknown): IGetMailboxesAnalyticsResponse => {
  const source = isObject(raw) ? raw : {};

  return {
    success: source.success === true,
    msg: toString(source.msg) || 'Успешно',
    code: toNumberOrUndefined(source.code),
    error: toString(source.error) || undefined,
    data: isObject(source.data) ? (source.data as unknown as MailboxesAnalyticsData) : null,
  };
};

export const getMailboxesAnalytics = async (
  payload: IGetMailboxesAnalyticsPayload
): Promise<IGetMailboxesAnalyticsResponse> => {
  return API<IGetMailboxesAnalyticsResponse>({
    url: '/api/analytics/mailboxes',
    method: 'GET',
    params: {
      account_id: payload.account_id,
      start_time: payload.start_time,
      end_time: payload.end_time,
      mailboxes: payload.mailboxes?.length ? payload.mailboxes.join(',') : undefined,
    },
  })
    .then(({ data }) => normalizeResponse(data))
    .catch((error: AxiosError) => {
      const errorName = 'analytics/getMailboxesAnalytics';
      throw new DetailsError(errorName, { status: error.response?.status });
    });
};

export const useGetMailboxesAnalytics = (payload: IGetMailboxesAnalyticsPayload) =>
  useQuery({
    queryKey: [getMailboxesAnalyticsKey, payload],
    queryFn: () => getMailboxesAnalytics(payload),
    select: (response) => response.data,
  });

export * from './getMailboxesAnalytics.types';

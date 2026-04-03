import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { API, DetailsError } from '@/shared/api';

import {
  DomainsAnalyticsData,
  IGetDomainsAnalyticsPayload,
  IGetDomainsAnalyticsResponse,
} from './getDomainsAnalytics.types';

export const getDomainsAnalyticsKey = 'getDomainsAnalytics';

const toString = (value: unknown): string => (typeof value === 'string' ? value : '');

const toNumberOrUndefined = (value: unknown): number | undefined => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const normalizeResponse = (raw: unknown): IGetDomainsAnalyticsResponse => {
  const source = isObject(raw) ? raw : {};

  return {
    success: source.success === true,
    msg: toString(source.msg) || 'Успешно',
    code: toNumberOrUndefined(source.code),
    error: toString(source.error) || undefined,
    data: isObject(source.data) ? (source.data as unknown as DomainsAnalyticsData) : null,
  };
};

export const getDomainsAnalytics = async (
  payload: IGetDomainsAnalyticsPayload
): Promise<IGetDomainsAnalyticsResponse> => {
  return API<IGetDomainsAnalyticsResponse>({
    url: '/api/analytics/domains',
    method: 'GET',
    params: {
      account_id: payload.account_id,
      start_time: payload.start_time,
      end_time: payload.end_time,
      domains: payload.domains?.length ? payload.domains.join(',') : undefined,
    },
  })
    .then(({ data }) => normalizeResponse(data))
    .catch((error: AxiosError) => {
      const errorName = 'analytics/getDomainsAnalytics';
      throw new DetailsError(errorName, { status: error.response?.status });
    });
};

export const useGetDomainsAnalytics = (payload: IGetDomainsAnalyticsPayload) =>
  useQuery({
    queryKey: [getDomainsAnalyticsKey, payload],
    queryFn: () => getDomainsAnalytics(payload),
    select: (response) => response.data,
  });

export * from './getDomainsAnalytics.types';

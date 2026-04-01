import { infiniteQueryOptions, useInfiniteQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { ValidationError } from 'yup';

import { API, DetailsError } from '@/shared/api';

import { IGetDomainsListPayload, IGetDomainsListResponse } from './getDomainsList.types';
import { getDomainsListResponseValidate } from './getDomainsList.validation';

export const getDomainsListKey = 'getDomainsList';

export const getDomainsList = async (
  params: IGetDomainsListPayload
): Promise<IGetDomainsListResponse> => {
  return API<IGetDomainsListResponse>({
    url: `/api/domains/list`,
    method: 'GET',
    params: {
      page: params.page,
    },
  })
    .then(({ data }) => getDomainsListResponseValidate.validate(data, { abortEarly: false }))
    .catch((error: AxiosError | ValidationError) => {
      const errorName = 'domains/getDomainsList';

      if (error instanceof AxiosError) {
        throw new DetailsError(errorName, { status: error.response?.status });
      } else {
        const validation = error.inner.map((error) => error.message);
        throw new DetailsError(errorName, { validation });
      }
    });
};

export const groupGetDomainsList = () =>
  infiniteQueryOptions({
    queryKey: [getDomainsListKey],
    queryFn: ({ pageParam }) => getDomainsList({ page: pageParam }),
    initialPageParam: 1,
    select: (data) => data.pages.map(({ data }) => data.list).flat(),
    getNextPageParam: (lastPage, _, lastPageParam) =>
      lastPage.data.list.length ? lastPageParam + 1 : undefined,
  });

export const useGetDomainsList = () => useInfiniteQuery(groupGetDomainsList());

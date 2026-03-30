import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { ValidationError } from 'yup';

import { API, DetailsError } from '@/shared/api';

import { IGetContactGroupsListResponse } from './getContactGroupsList.types';
import { getContactGroupsListResponseValidate } from './getContactGroupsList.validation';

export const getContactGroupsListKey = 'getContactGroupsList';

export const getContactGroupsList = async (): Promise<IGetContactGroupsListResponse> => {
  return API<IGetContactGroupsListResponse>({
    url: `/api/contact/group/list`,
    method: 'GET',
  })
    .then(({ data }) => getContactGroupsListResponseValidate.validate(data, { abortEarly: false }))
    .catch((error: AxiosError | ValidationError) => {
      const errorName = 'contacts/getContactGroupsList';

      if (error instanceof AxiosError) {
        throw new DetailsError(errorName, { status: error.response?.status });
      } else {
        const validation = error.inner.map((item) => item.message);
        throw new DetailsError(errorName, { validation });
      }
    });
};

export const useGetContactGroupsList = () =>
  useQuery({
    queryKey: [getContactGroupsListKey],
    queryFn: getContactGroupsList,
    select: (data) => data.data.list,
  });

export * from './getContactGroupsList.types';

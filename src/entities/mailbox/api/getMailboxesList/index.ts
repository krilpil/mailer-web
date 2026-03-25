import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { ValidationError } from 'yup';

import { API, DetailsError } from '@/shared/api';

import { IGetMailboxesListResponse } from './getMailboxesList.types';
import { getMailboxesListResponseValidate } from './getMailboxesList.validation';

export const getMailboxesListKey = 'getMailboxesList';

export const getMailboxesList = async (): Promise<IGetMailboxesListResponse> => {
  return API<IGetMailboxesListResponse>({
    url: `/api/mailbox/all`,
    method: 'GET',
  })
    .then(({ data }) => getMailboxesListResponseValidate.validate(data, { abortEarly: false }))
    .catch((error: AxiosError | ValidationError) => {
      const errorName = 'mailboxes/getMailboxesList';

      if (error instanceof AxiosError) {
        throw new DetailsError(errorName, { status: error.response?.status });
      } else {
        const validation = error.inner.map((error) => error.message);
        throw new DetailsError(errorName, { validation });
      }
    });
};

export const useGetMailboxesList = () =>
  useQuery({
    queryKey: [getMailboxesListKey],
    queryFn: getMailboxesList,
    select: (data) => data.data.list,
  });

export * from './getMailboxesList.types';

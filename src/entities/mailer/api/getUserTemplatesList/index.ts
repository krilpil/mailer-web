import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { ValidationError } from 'yup';

import { API, DetailsError } from '@/shared/api';

import { IGetUserTemplatesListResponse } from './getUserTemplatesList.types';
import { getUserTemplatesListResponseValidate } from './getUserTemplatesList.validation';

export const getUserTemplatesListKey = 'getUserTemplatesList';

const getUserTemplatesList = async (): Promise<IGetUserTemplatesListResponse> => {
  return API<IGetUserTemplatesListResponse>({
    url: '/api/email_template/list',
    method: 'GET',
  })
    .then(({ data }) => getUserTemplatesListResponseValidate.validate(data, { abortEarly: false }))
    .catch((error: AxiosError | ValidationError) => {
      const errorName = 'mailer/getUserTemplatesList';

      if (error instanceof AxiosError) {
        throw new DetailsError(errorName, { status: error.response?.status });
      }

      const validation = error.inner.map((item) => item.message);
      throw new DetailsError(errorName, { validation });
    });
};

export const useGetUserTemplatesList = () =>
  useQuery({
    queryKey: [getUserTemplatesListKey],
    queryFn: getUserTemplatesList,
    select: (data) => data.data.list,
  });

export * from './getUserTemplatesList.types';

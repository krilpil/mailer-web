import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { ValidationError } from 'yup';

import { API, DetailsError, queryClient } from '@/shared/api';

import { createUserTemplateResponseValidate } from './createUserTemplate.validation';
import {
  ICreateUserTemplatePayload,
  ICreateUserTemplateResponse,
} from './createUserTemplate.types';
import { getUserTemplatesListKey } from '../getUserTemplatesList';

const createUserTemplateKey = 'createUserTemplate';

const createUserTemplate = async (
  payload: ICreateUserTemplatePayload
): Promise<ICreateUserTemplateResponse> => {
  return API<ICreateUserTemplateResponse>({
    url: '/api/email_template/create',
    method: 'POST',
    data: payload,
  })
    .then(({ data }) => createUserTemplateResponseValidate.validate(data, { abortEarly: false }))
    .catch((error: AxiosError | ValidationError) => {
      const errorName = 'mailer/createUserTemplate';

      if (error instanceof AxiosError) {
        throw new DetailsError(errorName, { status: error.response?.status });
      }

      const validation = error.inner.map((item) => item.message);
      throw new DetailsError(errorName, { validation });
    });
};

export const useCreateUserTemplate = () =>
  useMutation({
    mutationKey: [createUserTemplateKey],
    mutationFn: (payload: ICreateUserTemplatePayload) => createUserTemplate(payload),
    onSuccess: async () => {
      await queryClient.refetchQueries({ queryKey: [getUserTemplatesListKey] });
    },
  });

export * from './createUserTemplate.types';

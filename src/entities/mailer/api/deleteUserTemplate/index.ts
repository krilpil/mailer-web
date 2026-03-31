import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { ValidationError } from 'yup';

import { API, DetailsError, queryClient } from '@/shared/api';

import { getUserTemplatesListKey } from '../getUserTemplatesList';
import {
  IDeleteUserTemplatePayload,
  IDeleteUserTemplateResponse,
} from './deleteUserTemplate.types';
import { deleteUserTemplateResponseValidate } from './deleteUserTemplate.validation';

const deleteUserTemplateKey = 'deleteUserTemplate';

const deleteUserTemplate = async (
  payload: IDeleteUserTemplatePayload
): Promise<IDeleteUserTemplateResponse> => {
  return API<IDeleteUserTemplateResponse>({
    url: '/api/email_template/delete',
    method: 'POST',
    data: payload,
  })
    .then(({ data }) => deleteUserTemplateResponseValidate.validate(data, { abortEarly: false }))
    .catch((error: AxiosError | ValidationError) => {
      const errorName = 'mailer/deleteUserTemplate';

      if (error instanceof AxiosError) {
        throw new DetailsError(errorName, { status: error.response?.status });
      }

      const validation = error.inner.map((item) => item.message);
      throw new DetailsError(errorName, { validation });
    });
};

export const useDeleteUserTemplate = () =>
  useMutation({
    mutationKey: [deleteUserTemplateKey],
    mutationFn: (payload: IDeleteUserTemplatePayload) => deleteUserTemplate(payload),
    onSuccess: async () => {
      await queryClient.refetchQueries({ queryKey: [getUserTemplatesListKey] });
    },
  });

export * from './deleteUserTemplate.types';

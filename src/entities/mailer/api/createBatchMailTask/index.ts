import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { ValidationError } from 'yup';

import { API, DetailsError } from '@/shared/api';

import {
  ICreateBatchMailTaskPayload,
  ICreateBatchMailTaskResponse,
} from './createBatchMailTask.types';
import { createBatchMailTaskResponseValidate } from './createBatchMailTask.validation';

const createBatchMailTaskKey = 'createBatchMailTask';

const createBatchMailTask = async (
  payload: ICreateBatchMailTaskPayload
): Promise<ICreateBatchMailTaskResponse> => {
  return API<ICreateBatchMailTaskResponse>({
    url: '/api/batch_mail/task/create',
    method: 'POST',
    data: payload,
  })
    .then(({ data }) => createBatchMailTaskResponseValidate.validate(data, { abortEarly: false }))
    .catch((error: AxiosError | ValidationError) => {
      const errorName = 'mailer/createBatchMailTask';

      if (error instanceof AxiosError) {
        throw new DetailsError(errorName, { status: error.response?.status });
      }

      const validation = error.inner.map((item) => item.message);
      throw new DetailsError(errorName, { validation });
    });
};

export const useCreateBatchMailTask = () =>
  useMutation({
    mutationKey: [createBatchMailTaskKey],
    mutationFn: (payload: ICreateBatchMailTaskPayload) => createBatchMailTask(payload),
  });

export * from './createBatchMailTask.types';

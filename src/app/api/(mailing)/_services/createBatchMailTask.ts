import axios from 'axios';

import { ICreateBatchMailTaskProviderPayload } from '../batch_mail/task/create/createTask.types';

export interface ICreateBatchMailTaskProviderResponse {
  success?: boolean;
  code?: number;
  msg?: string;
  error?: string;
  data?: {
    id?: number;
  };
}

export const createBatchMailTask = async (payload: ICreateBatchMailTaskProviderPayload) => {
  return axios<ICreateBatchMailTaskProviderResponse>({
    url: `${process.env.BILLION_MAIL_API}/batch_mail/task/create`,
    method: 'POST',
    headers: {
      authorization: `${process.env.BILLION_MAIL_TOKEN}`,
      'Content-Type': 'application/json',
    },
    data: payload,
  });
};

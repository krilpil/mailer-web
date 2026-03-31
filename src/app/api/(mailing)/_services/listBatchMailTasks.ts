import axios from 'axios';

import { IListBatchMailTasksQuery } from '../batch_mail/task/list/listTasks.types';

export interface IProviderBatchMailTask {
  [key: string]: unknown;
}

export interface IListBatchMailTasksProviderResponse {
  success?: boolean;
  code?: number;
  msg?: string;
  error?: string;
  data?: {
    total?: number;
    list?: IProviderBatchMailTask[];
  };
}

export const listBatchMailTasks = async (payload: IListBatchMailTasksQuery) => {
  const params: Record<string, number | string> = {
    page: payload.page,
    page_size: payload.page_size,
  };

  if (typeof payload.keyword === 'string' && payload.keyword.trim()) {
    params.keyword = payload.keyword.trim();
  }

  if (
    typeof payload.status === 'number' &&
    Number.isFinite(payload.status) &&
    payload.status >= 0
  ) {
    params.status = payload.status;
  }

  return axios<IListBatchMailTasksProviderResponse>({
    url: `${process.env.BILLION_MAIL_API}/batch_mail/task/list`,
    method: 'GET',
    headers: {
      authorization: `${process.env.BILLION_MAIL_TOKEN}`,
      'Content-Type': 'application/json',
    },
    params,
  });
};

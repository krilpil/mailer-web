import axios from 'axios';

export interface IGetBatchMailTaskLogsPayload {
  task_id: number;
  status?: number;
  domain?: string;
  page?: number;
  page_size?: number;
}

export interface IProviderBatchMailTaskLogItem {
  [key: string]: unknown;
}

export interface IGetBatchMailTaskLogsProviderResponse {
  success?: boolean;
  code?: number;
  msg?: string;
  error?: string;
  data?: {
    total?: number;
    list?: IProviderBatchMailTaskLogItem[];
  };
}

export const getBatchMailTaskLogs = async (payload: IGetBatchMailTaskLogsPayload) => {
  const params: Record<string, number | string> = {
    task_id: payload.task_id,
  };

  if (
    typeof payload.status === 'number' &&
    Number.isFinite(payload.status) &&
    (payload.status === 0 || payload.status === 1)
  ) {
    params.status = payload.status;
  }

  if (typeof payload.domain === 'string' && payload.domain.trim()) {
    params.domain = payload.domain.trim();
  }

  if (typeof payload.page === 'number' && Number.isFinite(payload.page) && payload.page > 0) {
    params.page = payload.page;
  }

  if (
    typeof payload.page_size === 'number' &&
    Number.isFinite(payload.page_size) &&
    payload.page_size > 0
  ) {
    params.page_size = payload.page_size;
  }

  return axios<IGetBatchMailTaskLogsProviderResponse>({
    url: `${process.env.BILLION_MAIL_API}/batch_mail/tracking/logs`,
    method: 'GET',
    headers: {
      authorization: `${process.env.BILLION_MAIL_TOKEN}`,
      'Content-Type': 'application/json',
    },
    params,
  });
};

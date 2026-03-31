import axios from 'axios';

export interface IGetBatchMailTaskMailProviderStatPayload {
  task_id: number;
  status?: number;
}

export interface IGetBatchMailTaskMailProviderStatProviderResponse {
  success?: boolean;
  code?: number;
  msg?: string;
  error?: string;
  data?: unknown;
}

export const getBatchMailTaskMailProviderStat = async (
  payload: IGetBatchMailTaskMailProviderStatPayload
) => {
  const params: Record<string, number> = {
    task_id: payload.task_id,
  };

  if (
    typeof payload.status === 'number' &&
    Number.isFinite(payload.status) &&
    (payload.status === 0 || payload.status === 1)
  ) {
    params.status = payload.status;
  }

  return axios<IGetBatchMailTaskMailProviderStatProviderResponse>({
    url: `${process.env.BILLION_MAIL_API}/batch_mail/tracking/mail_provider`,
    method: 'GET',
    headers: {
      authorization: `${process.env.BILLION_MAIL_TOKEN}`,
      'Content-Type': 'application/json',
    },
    params,
  });
};

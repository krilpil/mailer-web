import axios from 'axios';

export interface IGetBatchMailTaskStatChartPayload {
  task_id: number;
  start_time: number;
  end_time: number;
  domain?: string;
}

export interface IGetBatchMailTaskStatChartProviderResponse {
  success?: boolean;
  code?: number;
  msg?: string;
  error?: string;
  data?: {
    dashboard?: unknown;
    mail_providers?: unknown;
    send_mail_chart?: unknown;
    bounce_rate_chart?: unknown;
    open_rate_chart?: unknown;
    click_rate_chart?: unknown;
  };
}

export const getBatchMailTaskStatChart = async (payload: IGetBatchMailTaskStatChartPayload) => {
  const params: Record<string, number | string> = {
    task_id: payload.task_id,
    start_time: payload.start_time,
    end_time: payload.end_time,
  };

  if (typeof payload.domain === 'string' && payload.domain.trim()) {
    params.domain = payload.domain.trim();
  }

  return axios<IGetBatchMailTaskStatChartProviderResponse>({
    url: `${process.env.BILLION_MAIL_API}/batch_mail/task/stat_chart`,
    method: 'GET',
    headers: {
      authorization: `${process.env.BILLION_MAIL_TOKEN}`,
      'Content-Type': 'application/json',
    },
    params,
  });
};

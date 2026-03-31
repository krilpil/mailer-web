export interface BatchMailTaskAnalyticsLogType {
  postfix_message_id: string;
  status: string;
  recipient: string;
  mail_provider: string;
  delay: number;
  delays: string;
  dsn: string;
  relay: string;
  description: string;
  log_time: number;
}

export interface BatchMailTaskAnalyticsType {
  task_id: number;
  period: {
    start_time: number;
    end_time: number;
  };
  stat_chart: {
    dashboard: Record<string, unknown>;
    mail_providers: unknown;
    send_mail_chart: unknown;
    bounce_rate_chart: unknown;
    open_rate_chart: unknown;
    click_rate_chart: unknown;
  } | null;
  mail_provider: unknown;
  logs: {
    total: number;
    page: number;
    page_size: number;
    list: BatchMailTaskAnalyticsLogType[];
  };
  warnings: string[];
}

export interface IGetBatchMailTaskAnalyticsPayload {
  task_id: number;
  start_time?: number;
  end_time?: number;
  logs_status?: number;
  logs_domain?: string;
  logs_page?: number;
  logs_page_size?: number;
}

export interface IGetBatchMailTaskAnalyticsResponse {
  success: boolean;
  msg: string;
  code?: number;
  error?: string;
  data: BatchMailTaskAnalyticsType;
}

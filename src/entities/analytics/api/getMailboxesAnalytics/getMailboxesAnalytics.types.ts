export interface MailboxesTimelinePoint {
  date: string;
  tasks: number;
  recipients_total: number;
  sent_total: number;
  success_total: number;
  error_total: number;
  deferred_total: number;
}

export interface MailboxesAnalyticsCounter {
  key: string;
  count: number;
}

export interface MailboxAnalyticsItem {
  mailbox: string;
  domain: string;
  status: number;
  is_admin: number;
  quota: number;
  used_quota: number;
  quota_active: number;
  quota_usage_rate: number;
  mx: string;
  create_time: number;
  update_time: number;
  tasks_total: number;
  active_tasks: number;
  paused_tasks: number;
  recipients_total: number;
  sent_total: number;
  success_total: number;
  error_total: number;
  deferred_total: number;
  unsent_total: number;
  success_rate: number;
  error_rate: number;
  deferred_rate: number;
  completion_rate: number;
  progress_avg: number;
  estimated_time_avg: number;
  estimated_time_total: number;
  templates_total: number;
  groups_total: number;
  open_tracking_tasks: number;
  click_tracking_tasks: number;
  first_task_at: number | null;
  last_task_at: number | null;
  domain_dns_health_rate: number;
  domain_blacklist_total: number;
  failed: {
    total: number;
    by_status: MailboxesAnalyticsCounter[];
    by_dsn: MailboxesAnalyticsCounter[];
    by_sender: MailboxesAnalyticsCounter[];
    by_recipient: MailboxesAnalyticsCounter[];
    last_failed_at: number | null;
  };
  timeline_by_day: MailboxesTimelinePoint[];
}

export interface MailboxesAnalyticsSummary {
  mailboxes_total: number;
  active_mailboxes: number;
  admin_mailboxes: number;
  mailboxes_with_tasks: number;
  mailboxes_with_errors: number;
  total_quota: number;
  used_quota: number;
  quota_usage_rate: number;
  tasks_total: number;
  active_tasks_total: number;
  paused_tasks_total: number;
  recipients_total: number;
  sent_total: number;
  success_total: number;
  error_total: number;
  deferred_total: number;
  unsent_total: number;
  success_rate: number;
  error_rate: number;
  deferred_rate: number;
  completion_rate: number;
  failed_events_total: number;
  failed_recipients_total: number;
  average_domain_dns_health_rate: number;
}

export interface TopMailboxMetric {
  mailbox: string;
  sent_total: number;
  error_total: number;
  success_rate: number;
  quota_usage_rate: number;
  failed_total: number;
}

export interface MailboxesAnalyticsData {
  account_id: string;
  period: {
    start_time: number;
    end_time: number;
  };
  scoped_domains: string[];
  scoped_mailboxes: string[];
  summary: MailboxesAnalyticsSummary;
  mailboxes: MailboxAnalyticsItem[];
  top_mailboxes_by_sent: TopMailboxMetric[];
  top_mailboxes_by_errors: TopMailboxMetric[];
  top_mailboxes_by_quota_usage: TopMailboxMetric[];
  top_mailboxes_by_failure: TopMailboxMetric[];
  timeline_by_day: MailboxesTimelinePoint[];
  warnings: string[];
}

export interface IGetMailboxesAnalyticsPayload {
  account_id?: string;
  start_time?: number;
  end_time?: number;
  mailboxes?: string[];
}

export interface IGetMailboxesAnalyticsResponse {
  success: boolean;
  msg: string;
  code?: number;
  error?: string;
  data: MailboxesAnalyticsData | null;
}

export interface DomainsTimelinePoint {
  date: string;
  tasks: number;
  recipients_total: number;
  sent_total: number;
  success_total: number;
  error_total: number;
  deferred_total: number;
}

export interface DomainsAnalyticsCounter {
  key: string;
  count: number;
}

export interface DomainSenderSummary {
  mailbox: string;
  tasks: number;
  sent_total: number;
  success_total: number;
  error_total: number;
}

export interface DomainAnalyticsOverview {
  dashboard: Record<string, number | string | boolean>;
  mail_providers: unknown;
  send_mail_chart: unknown;
  bounce_rate_chart: unknown;
  open_rate_chart: unknown;
  click_rate_chart: unknown;
}

export interface DomainAnalyticsItem {
  domain: string;
  status: number;
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
  mailboxes_total: number;
  active_mailboxes_total: number;
  dns_valid_records: number;
  dns_total_records: number;
  dns_health_rate: number;
  dns_invalid_records: string[];
  ssl_expires_at: number | null;
  ssl_expires_in_days: number | null;
  blacklist_tested: number;
  blacklist_passed: number;
  blacklist_invalid: number;
  blacklist_total: number;
  current_usage: number;
  quota: number;
  quota_usage_rate: number;
  rate_limit: number;
  mailbox_quota: number;
  top_senders: DomainSenderSummary[];
  failed: {
    total: number;
    by_status: DomainsAnalyticsCounter[];
    by_dsn: DomainsAnalyticsCounter[];
    by_sender: DomainsAnalyticsCounter[];
    by_recipient: DomainsAnalyticsCounter[];
    last_failed_at: number | null;
  };
  timeline_by_day: DomainsTimelinePoint[];
  overview: DomainAnalyticsOverview | null;
}

export interface DomainsAnalyticsSummary {
  domains_total: number;
  domains_with_tasks: number;
  active_domains: number;
  domains_with_dns_issues: number;
  blacklisted_domains: number;
  mailboxes_total: number;
  active_mailboxes_total: number;
  unique_senders_total: number;
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
  average_dns_health_rate: number;
  total_quota: number;
  total_usage: number;
  quota_usage_rate: number;
}

export interface TopDomainMetric {
  domain: string;
  sent_total: number;
  error_total: number;
  success_rate: number;
  failed_total: number;
}

export interface DomainsAnalyticsData {
  account_id: string;
  period: {
    start_time: number;
    end_time: number;
  };
  scoped_domains: string[];
  scoped_mailboxes: string[];
  summary: DomainsAnalyticsSummary;
  domains: DomainAnalyticsItem[];
  top_domains_by_sent: TopDomainMetric[];
  top_domains_by_errors: TopDomainMetric[];
  top_domains_by_failure: TopDomainMetric[];
  timeline_by_day: DomainsTimelinePoint[];
  warnings: string[];
}

export interface IGetDomainsAnalyticsPayload {
  account_id?: string;
  start_time?: number;
  end_time?: number;
  domains?: string[];
}

export interface IGetDomainsAnalyticsResponse {
  success: boolean;
  msg: string;
  code?: number;
  error?: string;
  data: DomainsAnalyticsData | null;
}

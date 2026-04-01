import axios, { AxiosError } from 'axios';

import { getDataSource } from '@/database/data-source';
import {
  type IProviderBatchMailTask,
  listBatchMailTasks,
} from '@/app/api/(mailing)/_services/listBatchMailTasks';

const DAY_IN_SECONDS = 86_400;
const DEFAULT_TASKS_PAGE_SIZE = 100;
const MAX_TASKS_PAGES = 100;
const TOP_ITEMS_LIMIT = 10;

interface IProviderResponse<TData> {
  success?: boolean;
  code?: number;
  msg?: string;
  error?: string;
  data?: TData;
}

interface IAccountOwnership {
  domains: string[];
  mailboxes: Array<{
    username: string;
    domain: string;
  }>;
}

interface IProviderDomainRecord {
  domain: string;
  active: number;
  mailboxes: number;
  mailbox_quota: number;
  quota: number;
  rate_limit: number;
  current_usage: number;
  create_time: number;
  dns_records: Record<string, unknown>;
  cert_info: Record<string, unknown> | null;
  black_check_result: Record<string, unknown> | null;
}

interface IProviderMailboxRecord {
  username: string;
  domain: string;
  local_part: string;
  active: number;
  is_admin: number;
  quota: number;
  used_quota: number;
  quota_active: number;
  create_time: number;
  update_time: number;
  mx: string;
}

export interface IAnalyticsTask {
  id: number;
  addresser: string;
  domain: string;
  subject: string;
  active: number;
  pause: number;
  recipient_count: number;
  sent_count: number;
  success_count: number;
  error_count: number;
  deferred_count: number;
  unsent_count: number;
  progress: number;
  track_open: number;
  track_click: number;
  template_id: number;
  group_id: number;
  estimated_time_with_warmup: number;
  start_time: number;
  create_time: number;
  update_time: number;
  time_reference: number;
}

interface IProviderFailedEvent {
  postfix_message_id: string;
  sender: string;
  recipient: string;
  status: string;
  dsn: string;
  relay: string;
  description: string;
  delay: string;
  delays: string;
  log_time: number;
}

export interface IAnalyticsPeriod {
  start_time: number;
  end_time: number;
}

export interface IAnalyticsCounter {
  key: string;
  count: number;
}

export interface IAnalyticsTimelinePoint {
  date: string;
  tasks: number;
  recipients_total: number;
  sent_total: number;
  success_total: number;
  error_total: number;
  deferred_total: number;
}

export interface IDomainSenderSummary {
  mailbox: string;
  tasks: number;
  sent_total: number;
  success_total: number;
  error_total: number;
}

interface IAnalyticsOverviewData {
  dashboard: Record<string, number | string | boolean>;
  mail_providers: unknown;
  send_mail_chart: unknown;
  bounce_rate_chart: unknown;
  open_rate_chart: unknown;
  click_rate_chart: unknown;
}

interface IAnalyticsFailedSummary {
  total: number;
  by_status: IAnalyticsCounter[];
  by_dsn: IAnalyticsCounter[];
  by_sender: IAnalyticsCounter[];
  by_recipient: IAnalyticsCounter[];
  last_failed_at: number | null;
}

export interface IDomainAnalyticsItem {
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
  top_senders: IDomainSenderSummary[];
  failed: IAnalyticsFailedSummary;
  timeline_by_day: IAnalyticsTimelinePoint[];
  overview: IAnalyticsOverviewData | null;
}

export interface IDomainsAnalyticsSummary {
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

export interface ITopDomainMetric {
  domain: string;
  sent_total: number;
  error_total: number;
  success_rate: number;
  failed_total: number;
}

export interface IDomainsAnalyticsData {
  account_id: string;
  period: IAnalyticsPeriod;
  scoped_domains: string[];
  scoped_mailboxes: string[];
  summary: IDomainsAnalyticsSummary;
  domains: IDomainAnalyticsItem[];
  top_domains_by_sent: ITopDomainMetric[];
  top_domains_by_errors: ITopDomainMetric[];
  top_domains_by_failure: ITopDomainMetric[];
  timeline_by_day: IAnalyticsTimelinePoint[];
  warnings: string[];
}

export interface IMailboxAnalyticsItem {
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
  failed: IAnalyticsFailedSummary;
  timeline_by_day: IAnalyticsTimelinePoint[];
}

export interface IMailboxesAnalyticsSummary {
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

export interface ITopMailboxMetric {
  mailbox: string;
  sent_total: number;
  error_total: number;
  success_rate: number;
  quota_usage_rate: number;
  failed_total: number;
}

export interface IMailboxesAnalyticsData {
  account_id: string;
  period: IAnalyticsPeriod;
  scoped_domains: string[];
  scoped_mailboxes: string[];
  summary: IMailboxesAnalyticsSummary;
  mailboxes: IMailboxAnalyticsItem[];
  top_mailboxes_by_sent: ITopMailboxMetric[];
  top_mailboxes_by_errors: ITopMailboxMetric[];
  top_mailboxes_by_quota_usage: ITopMailboxMetric[];
  top_mailboxes_by_failure: ITopMailboxMetric[];
  timeline_by_day: IAnalyticsTimelinePoint[];
  warnings: string[];
}

export interface IAccountAnalyticsSource {
  account_id: string;
  period: IAnalyticsPeriod;
  scoped_domains: string[];
  scoped_mailboxes: string[];
  domains: string[];
  mailboxes: string[];
  tasks: IAnalyticsTask[];
  provider_domains: Map<string, IProviderDomainRecord>;
  provider_mailboxes: Map<string, IProviderMailboxRecord>;
  failed_by_domain: Record<string, IProviderFailedEvent[]>;
  overview_by_domain: Record<string, IAnalyticsOverviewData | null>;
  warnings: string[];
}

interface IBuildAccountAnalyticsSourcePayload {
  account_id: string;
  period: IAnalyticsPeriod;
  include_overview: boolean;
}

const toNumber = (value: unknown, fallback = 0): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toString = (value: unknown): string => (typeof value === 'string' ? value : '');

const toObject = (value: unknown): Record<string, unknown> | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
};

const normalizeDomain = (value: unknown): string => toString(value).trim().toLowerCase();

const extractEmail = (value: unknown): string => {
  const source = toString(value).trim();
  if (!source) return '';

  const lowered = source.toLowerCase();
  const match = lowered.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i);

  return match ? match[0] : '';
};

const extractDomainFromMailbox = (mailbox: string): string => {
  const index = mailbox.lastIndexOf('@');
  if (index < 0) return '';
  return mailbox.slice(index + 1).toLowerCase();
};

const safePercent = (value: number, total: number): number => {
  if (!Number.isFinite(value) || !Number.isFinite(total) || total <= 0) {
    return 0;
  }

  return Number(((value / total) * 100).toFixed(2));
};

const average = (values: number[]): number => {
  if (!values.length) return 0;

  const sum = values.reduce((acc, value) => acc + value, 0);
  return Number((sum / values.length).toFixed(2));
};

const normalizeUnixTime = (value: unknown): number => {
  const numericValue = toNumber(value, -1);
  if (numericValue >= 0) {
    return numericValue;
  }

  const source = toString(value).trim();
  if (!source) return 0;

  const timestamp = Date.parse(source);
  if (!Number.isFinite(timestamp)) return 0;

  return Math.floor(timestamp / 1000);
};

const parseSslExpireTime = (certInfo: Record<string, unknown> | null): number | null => {
  if (!certInfo) return null;

  const byEndTime = toNumber(certInfo.endtime, 0);
  if (byEndTime > 0) {
    return byEndTime;
  }

  const byNotAfter = normalizeUnixTime(certInfo.not_after);
  if (byNotAfter > 0) {
    return byNotAfter;
  }

  return null;
};

const isTaskInPeriod = (task: IAnalyticsTask, period: IAnalyticsPeriod): boolean => {
  if (task.time_reference <= 0) {
    return true;
  }

  return task.time_reference >= period.start_time && task.time_reference <= period.end_time;
};

const formatDay = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);
  return date.toISOString().slice(0, 10);
};

const buildTimelineByDay = (tasks: IAnalyticsTask[]): IAnalyticsTimelinePoint[] => {
  const map = new Map<string, IAnalyticsTimelinePoint>();

  tasks.forEach((task) => {
    if (task.time_reference <= 0) {
      return;
    }

    const date = formatDay(task.time_reference);
    const current = map.get(date) || {
      date,
      tasks: 0,
      recipients_total: 0,
      sent_total: 0,
      success_total: 0,
      error_total: 0,
      deferred_total: 0,
    };

    current.tasks += 1;
    current.recipients_total += task.recipient_count;
    current.sent_total += task.sent_count;
    current.success_total += task.success_count;
    current.error_total += task.error_count;
    current.deferred_total += task.deferred_count;

    map.set(date, current);
  });

  return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
};

const toCounters = (map: Map<string, number>, limit = TOP_ITEMS_LIMIT): IAnalyticsCounter[] => {
  return Array.from(map.entries())
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count || a.key.localeCompare(b.key))
    .slice(0, limit);
};

const uniqueWarnings = (warnings: string[]): string[] =>
  Array.from(new Set(warnings.map((warning) => warning.trim()).filter((warning) => !!warning)));

const buildProviderHeaders = () => ({
  authorization: `${process.env.BILLION_MAIL_TOKEN}`,
  'Content-Type': 'application/json',
});

const providerGet = async <T>(url: string, params?: Record<string, unknown>): Promise<T> => {
  const response = await axios<T>({
    url: `${process.env.BILLION_MAIL_API}${url}`,
    method: 'GET',
    headers: buildProviderHeaders(),
    params,
  });

  return response.data;
};

const readOwnership = async (accountId: string): Promise<IAccountOwnership> => {
  const dataSource = await getDataSource();

  const [domainRows, mailboxRows] = await Promise.all([
    dataSource.query('SELECT domain FROM account_domain WHERE account_id = $1', [accountId]),
    dataSource.query('SELECT username, domain FROM account_mailbox WHERE account_id = $1', [
      accountId,
    ]),
  ]);

  const domains = Array.from(
    new Set(
      (domainRows as Array<{ domain?: unknown }>)
        .map((row) => normalizeDomain(row.domain))
        .filter((domain) => !!domain)
    )
  );

  const mailboxes = (mailboxRows as Array<{ username?: unknown; domain?: unknown }>)
    .map((row) => {
      const username = extractEmail(row.username);
      const domain = normalizeDomain(row.domain) || extractDomainFromMailbox(username);

      if (!username || !domain) {
        return null;
      }

      return {
        username,
        domain,
      };
    })
    .filter((row): row is { username: string; domain: string } => row !== null);

  return {
    domains,
    mailboxes,
  };
};

const normalizeTask = (value: IProviderBatchMailTask): IAnalyticsTask | null => {
  const source = toObject(value);
  if (!source) {
    return null;
  }

  const id = toNumber(source.id, 0);
  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }

  const addresser = extractEmail(source.addresser);
  const domain = extractDomainFromMailbox(addresser);

  const startTime = toNumber(source.start_time);
  const createTime = toNumber(source.create_time);
  const updateTime = toNumber(source.update_time);
  const timeReference =
    (startTime > 0 ? startTime : 0) ||
    (createTime > 0 ? createTime : 0) ||
    (updateTime > 0 ? updateTime : 0);

  return {
    id,
    addresser,
    domain,
    subject: toString(source.subject),
    active: toNumber(source.active),
    pause: toNumber(source.pause),
    recipient_count: toNumber(source.recipient_count),
    sent_count: toNumber(source.sent_count, toNumber(source.sendsCount)),
    success_count: toNumber(source.success_count, toNumber(source.deliveredCount)),
    error_count: toNumber(source.error_count, toNumber(source.bouncedCount)),
    deferred_count: toNumber(source.deferred, toNumber(source.deferredCount)),
    unsent_count: toNumber(source.unsent_count),
    progress: toNumber(source.progress, toNumber(source.task_process)),
    track_open: toNumber(source.track_open),
    track_click: toNumber(source.track_click),
    template_id: toNumber(source.template_id),
    group_id: toNumber(source.group_id),
    estimated_time_with_warmup: toNumber(source.estimated_time_with_warmup),
    start_time: startTime,
    create_time: createTime,
    update_time: updateTime,
    time_reference: timeReference,
  };
};

const normalizeProviderDomain = (value: unknown): IProviderDomainRecord | null => {
  const source = toObject(value);
  if (!source) {
    return null;
  }

  const domain = normalizeDomain(source.domain);
  if (!domain) {
    return null;
  }

  return {
    domain,
    active: toNumber(source.active),
    mailboxes: toNumber(source.mailboxes),
    mailbox_quota: toNumber(source.mailbox_quota),
    quota: toNumber(source.quota),
    rate_limit: toNumber(source.rate_limit),
    current_usage: toNumber(source.current_usage),
    create_time: toNumber(source.create_time),
    dns_records: toObject(source.dns_records) || {},
    cert_info: toObject(source.cert_info),
    black_check_result: toObject(source.black_check_result),
  };
};

const normalizeProviderMailbox = (
  value: unknown,
  fallbackDomain = ''
): IProviderMailboxRecord | null => {
  const source = toObject(value);
  if (!source) {
    return null;
  }

  const username = extractEmail(source.username);
  const domain =
    normalizeDomain(source.domain) || extractDomainFromMailbox(username) || fallbackDomain;

  if (!username || !domain) {
    return null;
  }

  return {
    username,
    domain,
    local_part: toString(source.local_part),
    active: toNumber(source.active),
    is_admin: toNumber(source.is_admin),
    quota: toNumber(source.quota),
    used_quota: toNumber(source.used_quota),
    quota_active: toNumber(source.quota_active),
    create_time: toNumber(source.create_time),
    update_time: toNumber(source.update_time),
    mx: toString(source.mx),
  };
};

const normalizeFailedEvent = (value: unknown): IProviderFailedEvent | null => {
  const source = toObject(value);
  if (!source) {
    return null;
  }

  return {
    postfix_message_id: toString(source.postfix_message_id),
    sender: extractEmail(source.sender),
    recipient: extractEmail(source.recipient),
    status: toString(source.status),
    dsn: toString(source.dsn),
    relay: toString(source.relay),
    description: toString(source.description),
    delay: toString(source.delay),
    delays: toString(source.delays),
    log_time: normalizeUnixTime(source.log_time),
  };
};

const extractOverview = (value: unknown): IAnalyticsOverviewData | null => {
  const source = toObject(value);
  if (!source) {
    return null;
  }

  const dashboardSource = toObject(source.dashboard) || source;

  const dashboard = Object.entries(dashboardSource).reduce<
    Record<string, number | string | boolean>
  >((acc, [key, rawValue]) => {
    if (
      typeof rawValue === 'number' ||
      typeof rawValue === 'string' ||
      typeof rawValue === 'boolean'
    ) {
      acc[key] = rawValue;
    }

    return acc;
  }, {});

  return {
    dashboard,
    mail_providers: source.mail_providers ?? null,
    send_mail_chart: source.send_mail_chart ?? null,
    bounce_rate_chart: source.bounce_rate_chart ?? null,
    open_rate_chart: source.open_rate_chart ?? null,
    click_rate_chart: source.click_rate_chart ?? null,
  };
};

const formatAxiosError = (prefix: string, error: unknown): string => {
  if (error instanceof AxiosError) {
    const body = toObject(error.response?.data);
    const message = toString(body?.msg) || toString(body?.error) || error.message;
    return `${prefix}: ${message || 'provider request failed'}`;
  }

  if (error instanceof Error) {
    return `${prefix}: ${error.message || 'request failed'}`;
  }

  return `${prefix}: request failed`;
};

const listAllProviderTasks = async (warnings: string[]): Promise<IAnalyticsTask[]> => {
  const tasks: IAnalyticsTask[] = [];

  for (let page = 1; page <= MAX_TASKS_PAGES; page += 1) {
    try {
      const body = (await listBatchMailTasks({ page, page_size: DEFAULT_TASKS_PAGE_SIZE })).data;

      if (!body?.success) {
        warnings.push(
          `Список задач рассылки (страница ${page}): ${body?.msg || 'provider request failed'}`
        );
        break;
      }

      const pageList = Array.isArray(body.data?.list)
        ? body.data.list
            .map((item) => normalizeTask(item))
            .filter((item): item is IAnalyticsTask => item !== null)
        : [];

      tasks.push(...pageList);

      const total = toNumber(body.data?.total, tasks.length);
      if (pageList.length < DEFAULT_TASKS_PAGE_SIZE || tasks.length >= total) {
        break;
      }

      if (page === MAX_TASKS_PAGES) {
        warnings.push(
          'Список задач рассылки: достигнут лимит страниц, данные могут быть неполными'
        );
      }
    } catch (error) {
      warnings.push(formatAxiosError(`Список задач рассылки (страница ${page})`, error));
      break;
    }
  }

  return tasks;
};

const getProviderDomains = async (
  scopedDomains: Set<string>,
  warnings: string[]
): Promise<Map<string, IProviderDomainRecord>> => {
  const domainMap = new Map<string, IProviderDomainRecord>();

  if (!scopedDomains.size) {
    return domainMap;
  }

  try {
    const body = await providerGet<IProviderResponse<unknown[]>>('/domains/all');

    if (!body?.success) {
      warnings.push(`Данные доменов: ${body?.msg || 'provider request failed'}`);
      return domainMap;
    }

    const list = Array.isArray(body.data) ? body.data : [];

    list.forEach((item) => {
      const normalized = normalizeProviderDomain(item);
      if (!normalized) return;
      if (!scopedDomains.has(normalized.domain)) return;

      domainMap.set(normalized.domain, normalized);
    });
  } catch (error) {
    warnings.push(formatAxiosError('Данные доменов', error));
  }

  return domainMap;
};

const getProviderMailboxes = async (
  scopedDomains: string[],
  warnings: string[]
): Promise<Map<string, IProviderMailboxRecord>> => {
  const mailboxMap = new Map<string, IProviderMailboxRecord>();

  if (!scopedDomains.length) {
    return mailboxMap;
  }

  const requests = scopedDomains.map(async (domain) => {
    const body = await providerGet<IProviderResponse<unknown[]>>('/mailbox/all', { domain });

    if (!body?.success) {
      throw new Error(`Почтовые ящики домена ${domain}: ${body?.msg || 'provider request failed'}`);
    }

    const list = Array.isArray(body.data) ? body.data : [];
    return { domain, list };
  });

  const settled = await Promise.allSettled(requests);

  settled.forEach((result) => {
    if (result.status === 'rejected') {
      warnings.push(formatAxiosError('Данные почтовых ящиков', result.reason));
      return;
    }

    result.value.list.forEach((item) => {
      const normalized = normalizeProviderMailbox(item, result.value.domain);
      if (!normalized) return;

      mailboxMap.set(normalized.username, normalized);
    });
  });

  return mailboxMap;
};

const getFailedByDomain = async (
  domains: string[],
  period: IAnalyticsPeriod,
  warnings: string[]
): Promise<Record<string, IProviderFailedEvent[]>> => {
  const result: Record<string, IProviderFailedEvent[]> = {};

  const requests = domains.map(async (domain) => {
    const body = await providerGet<IProviderResponse<unknown[]>>('/overview/failed', {
      domain,
      start_time: period.start_time,
      end_time: period.end_time,
    });

    if (!body?.success) {
      throw new Error(
        `Ошибки отправки домена ${domain}: ${body?.msg || 'provider request failed'}`
      );
    }

    const list = Array.isArray(body.data)
      ? body.data
          .map((item) => normalizeFailedEvent(item))
          .filter((item): item is IProviderFailedEvent => item !== null)
      : [];

    return { domain, list };
  });

  const settled = await Promise.allSettled(requests);

  settled.forEach((item) => {
    if (item.status === 'rejected') {
      warnings.push(formatAxiosError('Ошибки отправки', item.reason));
      return;
    }

    result[item.value.domain] = item.value.list;
  });

  domains.forEach((domain) => {
    if (!result[domain]) {
      result[domain] = [];
    }
  });

  return result;
};

const getOverviewByDomain = async (
  domains: string[],
  period: IAnalyticsPeriod,
  warnings: string[]
): Promise<Record<string, IAnalyticsOverviewData | null>> => {
  const result: Record<string, IAnalyticsOverviewData | null> = {};

  const requests = domains.map(async (domain) => {
    const body = await providerGet<IProviderResponse<unknown>>('/overview', {
      domain,
      start_time: period.start_time,
      end_time: period.end_time,
    });

    if (!body?.success) {
      throw new Error(`Сводка домена ${domain}: ${body?.msg || 'provider request failed'}`);
    }

    return {
      domain,
      data: extractOverview(body.data),
    };
  });

  const settled = await Promise.allSettled(requests);

  settled.forEach((item) => {
    if (item.status === 'rejected') {
      warnings.push(formatAxiosError('Сводка домена', item.reason));
      return;
    }

    result[item.value.domain] = item.value.data;
  });

  domains.forEach((domain) => {
    if (!Object.prototype.hasOwnProperty.call(result, domain)) {
      result[domain] = null;
    }
  });

  return result;
};

const parseDnsStats = (dnsRecords: Record<string, unknown>) => {
  const records = Object.entries(dnsRecords).filter(([, value]) => toObject(value) !== null);

  let valid = 0;
  let total = 0;
  const invalid: string[] = [];

  records.forEach(([key, value]) => {
    const record = toObject(value);
    if (!record || typeof record.valid !== 'boolean') {
      return;
    }

    total += 1;
    if (record.valid) {
      valid += 1;
    } else {
      invalid.push(key);
    }
  });

  return {
    valid,
    total,
    invalid,
    health_rate: safePercent(valid, total),
  };
};

const buildFailedSummary = (events: IProviderFailedEvent[]): IAnalyticsFailedSummary => {
  const byStatus = new Map<string, number>();
  const byDsn = new Map<string, number>();
  const bySender = new Map<string, number>();
  const byRecipient = new Map<string, number>();

  let lastFailedAt = 0;

  events.forEach((event) => {
    const status = event.status || 'unknown';
    const dsn = event.dsn || 'unknown';
    const sender = event.sender || 'unknown';
    const recipient = event.recipient || 'unknown';

    byStatus.set(status, (byStatus.get(status) || 0) + 1);
    byDsn.set(dsn, (byDsn.get(dsn) || 0) + 1);
    bySender.set(sender, (bySender.get(sender) || 0) + 1);
    byRecipient.set(recipient, (byRecipient.get(recipient) || 0) + 1);

    if (event.log_time > lastFailedAt) {
      lastFailedAt = event.log_time;
    }
  });

  return {
    total: events.length,
    by_status: toCounters(byStatus),
    by_dsn: toCounters(byDsn),
    by_sender: toCounters(bySender),
    by_recipient: toCounters(byRecipient),
    last_failed_at: lastFailedAt > 0 ? lastFailedAt : null,
  };
};

const buildTaskRates = (task: {
  sent_total: number;
  success_total: number;
  error_total: number;
  deferred_total: number;
  recipients_total: number;
}) => {
  const deliveryBase = Math.max(
    task.sent_total,
    task.success_total + task.error_total + task.deferred_total
  );

  return {
    success_rate: safePercent(task.success_total, deliveryBase),
    error_rate: safePercent(task.error_total, deliveryBase),
    deferred_rate: safePercent(task.deferred_total, deliveryBase),
    completion_rate: safePercent(task.sent_total, task.recipients_total),
  };
};

const sortDomains = (domains: string[]) =>
  Array.from(new Set(domains))
    .map((domain) => domain.trim().toLowerCase())
    .filter((domain) => !!domain)
    .sort((a, b) => a.localeCompare(b));

const sortMailboxes = (mailboxes: string[]) =>
  Array.from(new Set(mailboxes))
    .map((mailbox) => extractEmail(mailbox))
    .filter((mailbox) => !!mailbox)
    .sort((a, b) => a.localeCompare(b));

export const buildAccountAnalyticsSource = async ({
  account_id,
  period,
  include_overview,
}: IBuildAccountAnalyticsSourcePayload): Promise<IAccountAnalyticsSource> => {
  const warnings: string[] = [];

  const ownership = await readOwnership(account_id);

  const scopedDomainSet = new Set(sortDomains(ownership.domains));
  const scopedMailboxSet = new Set(sortMailboxes(ownership.mailboxes.map((item) => item.username)));

  if (scopedDomainSet.size === 0 && scopedMailboxSet.size === 0) {
    return {
      account_id,
      period,
      scoped_domains: [],
      scoped_mailboxes: [],
      domains: [],
      mailboxes: [],
      tasks: [],
      provider_domains: new Map<string, IProviderDomainRecord>(),
      provider_mailboxes: new Map<string, IProviderMailboxRecord>(),
      failed_by_domain: {},
      overview_by_domain: {},
      warnings: [],
    };
  }

  ownership.mailboxes.forEach((mailbox) => {
    if (mailbox.domain) {
      scopedDomainSet.add(mailbox.domain);
    }
  });

  const providerDomains = await getProviderDomains(scopedDomainSet, warnings);
  const providerMailboxes = await getProviderMailboxes(Array.from(scopedDomainSet), warnings);

  ownership.mailboxes.forEach((mailbox) => {
    if (!providerMailboxes.has(mailbox.username)) {
      providerMailboxes.set(mailbox.username, {
        username: mailbox.username,
        domain: mailbox.domain,
        local_part: mailbox.username.split('@')[0] || '',
        active: 0,
        is_admin: 0,
        quota: 0,
        used_quota: 0,
        quota_active: 0,
        create_time: 0,
        update_time: 0,
        mx: '',
      });
    }
  });

  providerMailboxes.forEach((mailbox) => {
    scopedMailboxSet.add(mailbox.username);
    if (mailbox.domain) {
      scopedDomainSet.add(mailbox.domain);
    }
  });

  const rawTasks = await listAllProviderTasks(warnings);
  const scopedTasks = rawTasks.filter((task) => {
    const byMailbox = task.addresser && scopedMailboxSet.has(task.addresser);
    const byDomain = task.domain && scopedDomainSet.has(task.domain);

    return (byMailbox || byDomain) && isTaskInPeriod(task, period);
  });

  scopedTasks.forEach((task) => {
    if (task.addresser) {
      scopedMailboxSet.add(task.addresser);
      if (!providerMailboxes.has(task.addresser)) {
        providerMailboxes.set(task.addresser, {
          username: task.addresser,
          domain: task.domain,
          local_part: task.addresser.split('@')[0] || '',
          active: 0,
          is_admin: 0,
          quota: 0,
          used_quota: 0,
          quota_active: 0,
          create_time: 0,
          update_time: 0,
          mx: '',
        });
      }
    }

    if (task.domain) {
      scopedDomainSet.add(task.domain);
      if (!providerDomains.has(task.domain)) {
        providerDomains.set(task.domain, {
          domain: task.domain,
          active: 0,
          mailboxes: 0,
          mailbox_quota: 0,
          quota: 0,
          rate_limit: 0,
          current_usage: 0,
          create_time: 0,
          dns_records: {},
          cert_info: null,
          black_check_result: null,
        });
      }
    }
  });

  const analyticsDomains = sortDomains(Array.from(scopedDomainSet));
  const analyticsMailboxes = sortMailboxes(Array.from(scopedMailboxSet));

  const failedByDomain = await getFailedByDomain(analyticsDomains, period, warnings);
  const overviewByDomain = include_overview
    ? await getOverviewByDomain(analyticsDomains, period, warnings)
    : analyticsDomains.reduce<Record<string, IAnalyticsOverviewData | null>>((acc, domain) => {
        acc[domain] = null;
        return acc;
      }, {});

  return {
    account_id,
    period,
    scoped_domains: sortDomains(ownership.domains),
    scoped_mailboxes: sortMailboxes(ownership.mailboxes.map((item) => item.username)),
    domains: analyticsDomains,
    mailboxes: analyticsMailboxes,
    tasks: scopedTasks,
    provider_domains: providerDomains,
    provider_mailboxes: providerMailboxes,
    failed_by_domain: failedByDomain,
    overview_by_domain: overviewByDomain,
    warnings: uniqueWarnings(warnings),
  };
};

const getDomainsFilter = (sourceDomains: string[], requestedDomains?: string[]): Set<string> => {
  const sourceSet = new Set(sortDomains(sourceDomains));

  if (!requestedDomains || requestedDomains.length === 0) {
    return sourceSet;
  }

  const filtered = sortDomains(requestedDomains).filter((domain) => sourceSet.has(domain));

  return new Set(filtered);
};

const getMailboxesFilter = (
  sourceMailboxes: string[],
  requestedMailboxes?: string[]
): Set<string> => {
  const sourceSet = new Set(sortMailboxes(sourceMailboxes));

  if (!requestedMailboxes || requestedMailboxes.length === 0) {
    return sourceSet;
  }

  const filtered = sortMailboxes(requestedMailboxes).filter((mailbox) => sourceSet.has(mailbox));

  return new Set(filtered);
};

export const buildDomainsAnalytics = (
  source: IAccountAnalyticsSource,
  requestedDomains?: string[]
): IDomainsAnalyticsData => {
  const domainFilter = getDomainsFilter(source.domains, requestedDomains);
  const filteredDomains = Array.from(domainFilter).sort((a, b) => a.localeCompare(b));

  const tasksByDomain = new Map<string, IAnalyticsTask[]>();
  const senderSet = new Set<string>();

  source.tasks.forEach((task) => {
    if (!task.domain || !domainFilter.has(task.domain)) {
      return;
    }

    senderSet.add(task.addresser);

    const current = tasksByDomain.get(task.domain) || [];
    current.push(task);
    tasksByDomain.set(task.domain, current);
  });

  const mailboxesByDomain = new Map<string, Set<string>>();

  source.mailboxes.forEach((mailbox) => {
    const domain = extractDomainFromMailbox(mailbox);
    if (!domain || !domainFilter.has(domain)) {
      return;
    }

    const current = mailboxesByDomain.get(domain) || new Set<string>();
    current.add(mailbox);
    mailboxesByDomain.set(domain, current);
  });

  const now = Math.floor(Date.now() / 1000);

  const domains = filteredDomains
    .map((domain): IDomainAnalyticsItem => {
      const providerDomain = source.provider_domains.get(domain);
      const domainTasks = tasksByDomain.get(domain) || [];
      const domainMailboxes = Array.from(mailboxesByDomain.get(domain) || new Set<string>());

      const activeMailboxesTotal = domainMailboxes.filter((mailbox) => {
        const item = source.provider_mailboxes.get(mailbox);
        return item ? item.active === 1 : false;
      }).length;

      const sentTotal = domainTasks.reduce((acc, task) => acc + task.sent_count, 0);
      const successTotal = domainTasks.reduce((acc, task) => acc + task.success_count, 0);
      const errorTotal = domainTasks.reduce((acc, task) => acc + task.error_count, 0);
      const deferredTotal = domainTasks.reduce((acc, task) => acc + task.deferred_count, 0);
      const recipientsTotal = domainTasks.reduce((acc, task) => acc + task.recipient_count, 0);
      const unsentTotal = domainTasks.reduce((acc, task) => acc + task.unsent_count, 0);

      const rates = buildTaskRates({
        sent_total: sentTotal,
        success_total: successTotal,
        error_total: errorTotal,
        deferred_total: deferredTotal,
        recipients_total: recipientsTotal,
      });

      const openTrackingTasks = domainTasks.filter((task) => task.track_open === 1).length;
      const clickTrackingTasks = domainTasks.filter((task) => task.track_click === 1).length;
      const activeTasks = domainTasks.filter((task) => task.active === 1).length;
      const pausedTasks = domainTasks.filter((task) => task.pause === 1).length;

      const templateSet = new Set(
        domainTasks.map((task) => task.template_id).filter((id) => id > 0)
      );
      const groupSet = new Set(domainTasks.map((task) => task.group_id).filter((id) => id > 0));
      const progressAvg = average(domainTasks.map((task) => task.progress));
      const estimatedTimeAvg = average(
        domainTasks
          .map((task) => task.estimated_time_with_warmup)
          .filter((value) => Number.isFinite(value) && value > 0)
      );
      const estimatedTimeTotal = domainTasks.reduce(
        (acc, task) => acc + Math.max(0, task.estimated_time_with_warmup),
        0
      );

      const firstTaskCandidates = domainTasks
        .map((task) => task.time_reference)
        .filter((time) => Number.isFinite(time) && time > 0);
      const firstTaskAt = firstTaskCandidates.length ? Math.min(...firstTaskCandidates) : null;
      const lastTaskAt = firstTaskCandidates.length ? Math.max(...firstTaskCandidates) : null;

      const senderMap = new Map<string, IDomainSenderSummary>();
      domainTasks.forEach((task) => {
        if (!task.addresser) {
          return;
        }

        const current = senderMap.get(task.addresser) || {
          mailbox: task.addresser,
          tasks: 0,
          sent_total: 0,
          success_total: 0,
          error_total: 0,
        };

        current.tasks += 1;
        current.sent_total += task.sent_count;
        current.success_total += task.success_count;
        current.error_total += task.error_count;

        senderMap.set(task.addresser, current);
      });

      const topSenders = Array.from(senderMap.values())
        .sort((a, b) => b.sent_total - a.sent_total || b.tasks - a.tasks)
        .slice(0, TOP_ITEMS_LIMIT);

      const dnsStats = parseDnsStats(providerDomain?.dns_records || {});
      const sslExpiresAt = parseSslExpireTime(providerDomain?.cert_info || null);
      const sslExpiresInDays =
        sslExpiresAt && sslExpiresAt > 0 ? Math.floor((sslExpiresAt - now) / DAY_IN_SECONDS) : null;

      const blacklist = toObject(providerDomain?.black_check_result);
      const blacklistTested = toNumber(blacklist?.tested);
      const blacklistPassed = toNumber(blacklist?.passed);
      const blacklistInvalid = toNumber(blacklist?.invalid);
      const blacklistTotal = toNumber(blacklist?.blacklisted);

      const failedSummary = buildFailedSummary(source.failed_by_domain[domain] || []);
      const timelineByDay = buildTimelineByDay(domainTasks);
      const overview = source.overview_by_domain[domain] || null;

      const quota = providerDomain?.quota || 0;
      const currentUsage = providerDomain?.current_usage || 0;

      return {
        domain,
        status: providerDomain?.active || 0,
        tasks_total: domainTasks.length,
        active_tasks: activeTasks,
        paused_tasks: pausedTasks,
        recipients_total: recipientsTotal,
        sent_total: sentTotal,
        success_total: successTotal,
        error_total: errorTotal,
        deferred_total: deferredTotal,
        unsent_total: unsentTotal,
        success_rate: rates.success_rate,
        error_rate: rates.error_rate,
        deferred_rate: rates.deferred_rate,
        completion_rate: rates.completion_rate,
        progress_avg: progressAvg,
        estimated_time_avg: estimatedTimeAvg,
        estimated_time_total: estimatedTimeTotal,
        templates_total: templateSet.size,
        groups_total: groupSet.size,
        open_tracking_tasks: openTrackingTasks,
        click_tracking_tasks: clickTrackingTasks,
        first_task_at: firstTaskAt,
        last_task_at: lastTaskAt,
        mailboxes_total: domainMailboxes.length,
        active_mailboxes_total: activeMailboxesTotal,
        dns_valid_records: dnsStats.valid,
        dns_total_records: dnsStats.total,
        dns_health_rate: dnsStats.health_rate,
        dns_invalid_records: dnsStats.invalid,
        ssl_expires_at: sslExpiresAt,
        ssl_expires_in_days: sslExpiresInDays,
        blacklist_tested: blacklistTested,
        blacklist_passed: blacklistPassed,
        blacklist_invalid: blacklistInvalid,
        blacklist_total: blacklistTotal,
        current_usage: currentUsage,
        quota,
        quota_usage_rate: safePercent(currentUsage, quota),
        rate_limit: providerDomain?.rate_limit || 0,
        mailbox_quota: providerDomain?.mailbox_quota || 0,
        top_senders: topSenders,
        failed: failedSummary,
        timeline_by_day: timelineByDay,
        overview,
      };
    })
    .sort((a, b) => b.sent_total - a.sent_total || b.tasks_total - a.tasks_total);

  const allTimeline = buildTimelineByDay(
    source.tasks.filter((task) => task.domain && domainFilter.has(task.domain))
  );

  const failedRecipientSet = new Set<string>();
  domains.forEach((item) => {
    (source.failed_by_domain[item.domain] || []).forEach((event) => {
      if (event.recipient) {
        failedRecipientSet.add(event.recipient);
      }
    });
  });

  const summary: IDomainsAnalyticsSummary = {
    domains_total: domains.length,
    domains_with_tasks: domains.filter((item) => item.tasks_total > 0).length,
    active_domains: domains.filter((item) => item.status === 1).length,
    domains_with_dns_issues: domains.filter((item) => item.dns_invalid_records.length > 0).length,
    blacklisted_domains: domains.filter((item) => item.blacklist_total > 0).length,
    mailboxes_total: domains.reduce((acc, item) => acc + item.mailboxes_total, 0),
    active_mailboxes_total: domains.reduce((acc, item) => acc + item.active_mailboxes_total, 0),
    unique_senders_total: senderSet.size,
    tasks_total: domains.reduce((acc, item) => acc + item.tasks_total, 0),
    active_tasks_total: domains.reduce((acc, item) => acc + item.active_tasks, 0),
    paused_tasks_total: domains.reduce((acc, item) => acc + item.paused_tasks, 0),
    recipients_total: domains.reduce((acc, item) => acc + item.recipients_total, 0),
    sent_total: domains.reduce((acc, item) => acc + item.sent_total, 0),
    success_total: domains.reduce((acc, item) => acc + item.success_total, 0),
    error_total: domains.reduce((acc, item) => acc + item.error_total, 0),
    deferred_total: domains.reduce((acc, item) => acc + item.deferred_total, 0),
    unsent_total: domains.reduce((acc, item) => acc + item.unsent_total, 0),
    success_rate: 0,
    error_rate: 0,
    deferred_rate: 0,
    completion_rate: 0,
    failed_events_total: domains.reduce((acc, item) => acc + item.failed.total, 0),
    failed_recipients_total: failedRecipientSet.size,
    average_dns_health_rate: average(
      domains
        .map((item) => item.dns_health_rate)
        .filter((value) => Number.isFinite(value) && value >= 0)
    ),
    total_quota: domains.reduce((acc, item) => acc + item.quota, 0),
    total_usage: domains.reduce((acc, item) => acc + item.current_usage, 0),
    quota_usage_rate: 0,
  };

  const summaryRates = buildTaskRates({
    sent_total: summary.sent_total,
    success_total: summary.success_total,
    error_total: summary.error_total,
    deferred_total: summary.deferred_total,
    recipients_total: summary.recipients_total,
  });

  summary.success_rate = summaryRates.success_rate;
  summary.error_rate = summaryRates.error_rate;
  summary.deferred_rate = summaryRates.deferred_rate;
  summary.completion_rate = summaryRates.completion_rate;
  summary.quota_usage_rate = safePercent(summary.total_usage, summary.total_quota);

  const topDomainsBySent: ITopDomainMetric[] = domains
    .slice()
    .sort((a, b) => b.sent_total - a.sent_total || b.success_total - a.success_total)
    .slice(0, TOP_ITEMS_LIMIT)
    .map((item) => ({
      domain: item.domain,
      sent_total: item.sent_total,
      error_total: item.error_total,
      success_rate: item.success_rate,
      failed_total: item.failed.total,
    }));

  const topDomainsByErrors: ITopDomainMetric[] = domains
    .slice()
    .sort((a, b) => b.error_total - a.error_total || b.sent_total - a.sent_total)
    .slice(0, TOP_ITEMS_LIMIT)
    .map((item) => ({
      domain: item.domain,
      sent_total: item.sent_total,
      error_total: item.error_total,
      success_rate: item.success_rate,
      failed_total: item.failed.total,
    }));

  const topDomainsByFailure: ITopDomainMetric[] = domains
    .slice()
    .sort((a, b) => b.failed.total - a.failed.total || b.error_total - a.error_total)
    .slice(0, TOP_ITEMS_LIMIT)
    .map((item) => ({
      domain: item.domain,
      sent_total: item.sent_total,
      error_total: item.error_total,
      success_rate: item.success_rate,
      failed_total: item.failed.total,
    }));

  return {
    account_id: source.account_id,
    period: source.period,
    scoped_domains: source.scoped_domains,
    scoped_mailboxes: source.scoped_mailboxes,
    summary,
    domains,
    top_domains_by_sent: topDomainsBySent,
    top_domains_by_errors: topDomainsByErrors,
    top_domains_by_failure: topDomainsByFailure,
    timeline_by_day: allTimeline,
    warnings: source.warnings,
  };
};

export const buildMailboxesAnalytics = (
  source: IAccountAnalyticsSource,
  requestedMailboxes?: string[]
): IMailboxesAnalyticsData => {
  const mailboxFilter = getMailboxesFilter(source.mailboxes, requestedMailboxes);
  const filteredMailboxes = Array.from(mailboxFilter).sort((a, b) => a.localeCompare(b));

  const tasksByMailbox = new Map<string, IAnalyticsTask[]>();

  source.tasks.forEach((task) => {
    if (!task.addresser || !mailboxFilter.has(task.addresser)) {
      return;
    }

    const current = tasksByMailbox.get(task.addresser) || [];
    current.push(task);
    tasksByMailbox.set(task.addresser, current);
  });

  const failedByMailbox = new Map<string, IProviderFailedEvent[]>();

  Object.values(source.failed_by_domain).forEach((events) => {
    events.forEach((event) => {
      if (!event.sender || !mailboxFilter.has(event.sender)) {
        return;
      }

      const current = failedByMailbox.get(event.sender) || [];
      current.push(event);
      failedByMailbox.set(event.sender, current);
    });
  });

  const mailboxes = filteredMailboxes
    .map((mailbox): IMailboxAnalyticsItem => {
      const mailboxInfo = source.provider_mailboxes.get(mailbox);
      const mailboxDomain = mailboxInfo?.domain || extractDomainFromMailbox(mailbox);
      const mailboxTasks = tasksByMailbox.get(mailbox) || [];
      const mailboxFailedEvents = failedByMailbox.get(mailbox) || [];

      const sentTotal = mailboxTasks.reduce((acc, task) => acc + task.sent_count, 0);
      const successTotal = mailboxTasks.reduce((acc, task) => acc + task.success_count, 0);
      const errorTotal = mailboxTasks.reduce((acc, task) => acc + task.error_count, 0);
      const deferredTotal = mailboxTasks.reduce((acc, task) => acc + task.deferred_count, 0);
      const recipientsTotal = mailboxTasks.reduce((acc, task) => acc + task.recipient_count, 0);
      const unsentTotal = mailboxTasks.reduce((acc, task) => acc + task.unsent_count, 0);

      const rates = buildTaskRates({
        sent_total: sentTotal,
        success_total: successTotal,
        error_total: errorTotal,
        deferred_total: deferredTotal,
        recipients_total: recipientsTotal,
      });

      const openTrackingTasks = mailboxTasks.filter((task) => task.track_open === 1).length;
      const clickTrackingTasks = mailboxTasks.filter((task) => task.track_click === 1).length;
      const activeTasks = mailboxTasks.filter((task) => task.active === 1).length;
      const pausedTasks = mailboxTasks.filter((task) => task.pause === 1).length;

      const templateSet = new Set(
        mailboxTasks.map((task) => task.template_id).filter((id) => id > 0)
      );
      const groupSet = new Set(mailboxTasks.map((task) => task.group_id).filter((id) => id > 0));
      const progressAvg = average(mailboxTasks.map((task) => task.progress));
      const estimatedTimeAvg = average(
        mailboxTasks
          .map((task) => task.estimated_time_with_warmup)
          .filter((value) => Number.isFinite(value) && value > 0)
      );
      const estimatedTimeTotal = mailboxTasks.reduce(
        (acc, task) => acc + Math.max(0, task.estimated_time_with_warmup),
        0
      );

      const firstTaskCandidates = mailboxTasks
        .map((task) => task.time_reference)
        .filter((time) => Number.isFinite(time) && time > 0);
      const firstTaskAt = firstTaskCandidates.length ? Math.min(...firstTaskCandidates) : null;
      const lastTaskAt = firstTaskCandidates.length ? Math.max(...firstTaskCandidates) : null;

      const failedSummary = buildFailedSummary(mailboxFailedEvents);
      const timelineByDay = buildTimelineByDay(mailboxTasks);

      const domainInfo = source.provider_domains.get(mailboxDomain);
      const dnsStats = parseDnsStats(domainInfo?.dns_records || {});
      const blacklistInfo = toObject(domainInfo?.black_check_result);
      const blacklistTotal = toNumber(blacklistInfo?.blacklisted);

      const quota = mailboxInfo?.quota || 0;
      const usedQuota = mailboxInfo?.used_quota || 0;

      return {
        mailbox,
        domain: mailboxDomain,
        status: mailboxInfo?.active || 0,
        is_admin: mailboxInfo?.is_admin || 0,
        quota,
        used_quota: usedQuota,
        quota_active: mailboxInfo?.quota_active || 0,
        quota_usage_rate: safePercent(usedQuota, quota),
        mx: mailboxInfo?.mx || '',
        create_time: mailboxInfo?.create_time || 0,
        update_time: mailboxInfo?.update_time || 0,
        tasks_total: mailboxTasks.length,
        active_tasks: activeTasks,
        paused_tasks: pausedTasks,
        recipients_total: recipientsTotal,
        sent_total: sentTotal,
        success_total: successTotal,
        error_total: errorTotal,
        deferred_total: deferredTotal,
        unsent_total: unsentTotal,
        success_rate: rates.success_rate,
        error_rate: rates.error_rate,
        deferred_rate: rates.deferred_rate,
        completion_rate: rates.completion_rate,
        progress_avg: progressAvg,
        estimated_time_avg: estimatedTimeAvg,
        estimated_time_total: estimatedTimeTotal,
        templates_total: templateSet.size,
        groups_total: groupSet.size,
        open_tracking_tasks: openTrackingTasks,
        click_tracking_tasks: clickTrackingTasks,
        first_task_at: firstTaskAt,
        last_task_at: lastTaskAt,
        domain_dns_health_rate: dnsStats.health_rate,
        domain_blacklist_total: blacklistTotal,
        failed: failedSummary,
        timeline_by_day: timelineByDay,
      };
    })
    .sort((a, b) => b.sent_total - a.sent_total || b.tasks_total - a.tasks_total);

  const failedRecipientSet = new Set<string>();
  mailboxes.forEach((item) => {
    (failedByMailbox.get(item.mailbox) || []).forEach((event) => {
      if (event.recipient) {
        failedRecipientSet.add(event.recipient);
      }
    });
  });

  const summary: IMailboxesAnalyticsSummary = {
    mailboxes_total: mailboxes.length,
    active_mailboxes: mailboxes.filter((item) => item.status === 1).length,
    admin_mailboxes: mailboxes.filter((item) => item.is_admin === 1).length,
    mailboxes_with_tasks: mailboxes.filter((item) => item.tasks_total > 0).length,
    mailboxes_with_errors: mailboxes.filter((item) => item.error_total > 0 || item.failed.total > 0)
      .length,
    total_quota: mailboxes.reduce((acc, item) => acc + item.quota, 0),
    used_quota: mailboxes.reduce((acc, item) => acc + item.used_quota, 0),
    quota_usage_rate: 0,
    tasks_total: mailboxes.reduce((acc, item) => acc + item.tasks_total, 0),
    active_tasks_total: mailboxes.reduce((acc, item) => acc + item.active_tasks, 0),
    paused_tasks_total: mailboxes.reduce((acc, item) => acc + item.paused_tasks, 0),
    recipients_total: mailboxes.reduce((acc, item) => acc + item.recipients_total, 0),
    sent_total: mailboxes.reduce((acc, item) => acc + item.sent_total, 0),
    success_total: mailboxes.reduce((acc, item) => acc + item.success_total, 0),
    error_total: mailboxes.reduce((acc, item) => acc + item.error_total, 0),
    deferred_total: mailboxes.reduce((acc, item) => acc + item.deferred_total, 0),
    unsent_total: mailboxes.reduce((acc, item) => acc + item.unsent_total, 0),
    success_rate: 0,
    error_rate: 0,
    deferred_rate: 0,
    completion_rate: 0,
    failed_events_total: mailboxes.reduce((acc, item) => acc + item.failed.total, 0),
    failed_recipients_total: failedRecipientSet.size,
    average_domain_dns_health_rate: average(
      mailboxes
        .map((item) => item.domain_dns_health_rate)
        .filter((value) => Number.isFinite(value) && value >= 0)
    ),
  };

  const summaryRates = buildTaskRates({
    sent_total: summary.sent_total,
    success_total: summary.success_total,
    error_total: summary.error_total,
    deferred_total: summary.deferred_total,
    recipients_total: summary.recipients_total,
  });

  summary.success_rate = summaryRates.success_rate;
  summary.error_rate = summaryRates.error_rate;
  summary.deferred_rate = summaryRates.deferred_rate;
  summary.completion_rate = summaryRates.completion_rate;
  summary.quota_usage_rate = safePercent(summary.used_quota, summary.total_quota);

  const topMailboxesBySent: ITopMailboxMetric[] = mailboxes
    .slice()
    .sort((a, b) => b.sent_total - a.sent_total || b.success_total - a.success_total)
    .slice(0, TOP_ITEMS_LIMIT)
    .map((item) => ({
      mailbox: item.mailbox,
      sent_total: item.sent_total,
      error_total: item.error_total,
      success_rate: item.success_rate,
      quota_usage_rate: item.quota_usage_rate,
      failed_total: item.failed.total,
    }));

  const topMailboxesByErrors: ITopMailboxMetric[] = mailboxes
    .slice()
    .sort((a, b) => b.error_total - a.error_total || b.sent_total - a.sent_total)
    .slice(0, TOP_ITEMS_LIMIT)
    .map((item) => ({
      mailbox: item.mailbox,
      sent_total: item.sent_total,
      error_total: item.error_total,
      success_rate: item.success_rate,
      quota_usage_rate: item.quota_usage_rate,
      failed_total: item.failed.total,
    }));

  const topMailboxesByQuotaUsage: ITopMailboxMetric[] = mailboxes
    .slice()
    .sort((a, b) => b.quota_usage_rate - a.quota_usage_rate || b.used_quota - a.used_quota)
    .slice(0, TOP_ITEMS_LIMIT)
    .map((item) => ({
      mailbox: item.mailbox,
      sent_total: item.sent_total,
      error_total: item.error_total,
      success_rate: item.success_rate,
      quota_usage_rate: item.quota_usage_rate,
      failed_total: item.failed.total,
    }));

  const topMailboxesByFailure: ITopMailboxMetric[] = mailboxes
    .slice()
    .sort((a, b) => b.failed.total - a.failed.total || b.error_total - a.error_total)
    .slice(0, TOP_ITEMS_LIMIT)
    .map((item) => ({
      mailbox: item.mailbox,
      sent_total: item.sent_total,
      error_total: item.error_total,
      success_rate: item.success_rate,
      quota_usage_rate: item.quota_usage_rate,
      failed_total: item.failed.total,
    }));

  const timelineByDay = buildTimelineByDay(
    source.tasks.filter((task) => task.addresser && mailboxFilter.has(task.addresser))
  );

  return {
    account_id: source.account_id,
    period: source.period,
    scoped_domains: source.scoped_domains,
    scoped_mailboxes: source.scoped_mailboxes,
    summary,
    mailboxes,
    top_mailboxes_by_sent: topMailboxesBySent,
    top_mailboxes_by_errors: topMailboxesByErrors,
    top_mailboxes_by_quota_usage: topMailboxesByQuotaUsage,
    top_mailboxes_by_failure: topMailboxesByFailure,
    timeline_by_day: timelineByDay,
    warnings: source.warnings,
  };
};

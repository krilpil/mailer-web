'use client';

import React, { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import {
  Alert,
  Button,
  Card,
  Col,
  DatePicker,
  Empty,
  Row,
  Space,
  Statistic,
  Table,
  Tabs,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';

import {
  DomainAnalyticsItem,
  MailboxAnalyticsItem,
  TopDomainMetric,
  TopMailboxMetric,
  useGetDomainsAnalytics,
  useGetMailboxesAnalytics,
} from '@/entities/analytics';

const { RangePicker } = DatePicker;
type RangePickerValue = NonNullable<React.ComponentProps<typeof RangePicker>['value']>;

const formatNumber = (value: number) => {
  if (!Number.isFinite(value)) {
    return '0';
  }

  return value.toLocaleString('ru-RU');
};

const formatPercent = (value: number) => {
  if (!Number.isFinite(value)) {
    return '0.00%';
  }

  return `${value.toFixed(2)}%`;
};

const formatUnix = (value: number | null) => {
  if (!Number.isFinite(value) || !value || value <= 0) {
    return '—';
  }

  return dayjs.unix(value).format('DD.MM.YYYY HH:mm');
};

const formatDaysToExpire = (value: number | null) => {
  if (!Number.isFinite(value) || value === null) {
    return '—';
  }

  if (value < 0) {
    return `Просрочен на ${Math.abs(value)} дн.`;
  }

  return `${value} дн.`;
};

const formatQuota = (used: number, total: number) => {
  if (!Number.isFinite(total) || total <= 0) {
    return formatNumber(used);
  }

  return `${formatNumber(used)} / ${formatNumber(total)}`;
};

const domainColumns: ColumnsType<DomainAnalyticsItem> = [
  {
    title: 'Домен',
    dataIndex: 'domain',
    key: 'domain',
    fixed: 'left',
    width: 220,
  },
  {
    title: 'Задач',
    dataIndex: 'tasks_total',
    key: 'tasks_total',
    sorter: (a, b) => a.tasks_total - b.tasks_total,
    render: (value: number) => formatNumber(value),
  },
  {
    title: 'Отправлено',
    dataIndex: 'sent_total',
    key: 'sent_total',
    sorter: (a, b) => a.sent_total - b.sent_total,
    render: (value: number) => formatNumber(value),
  },
  {
    title: 'Успешно',
    dataIndex: 'success_total',
    key: 'success_total',
    sorter: (a, b) => a.success_total - b.success_total,
    render: (value: number) => formatNumber(value),
  },
  {
    title: 'Ошибки',
    dataIndex: 'error_total',
    key: 'error_total',
    sorter: (a, b) => a.error_total - b.error_total,
    render: (value: number) => formatNumber(value),
  },
  {
    title: 'Success Rate',
    dataIndex: 'success_rate',
    key: 'success_rate',
    sorter: (a, b) => a.success_rate - b.success_rate,
    render: (value: number) => formatPercent(value),
  },
  {
    title: 'Completion',
    dataIndex: 'completion_rate',
    key: 'completion_rate',
    sorter: (a, b) => a.completion_rate - b.completion_rate,
    render: (value: number) => formatPercent(value),
  },
  {
    title: 'Mailboxes',
    key: 'mailboxes',
    render: (_, record) =>
      `${formatNumber(record.active_mailboxes_total)} / ${formatNumber(record.mailboxes_total)}`,
  },
  {
    title: 'DNS Health',
    dataIndex: 'dns_health_rate',
    key: 'dns_health_rate',
    sorter: (a, b) => a.dns_health_rate - b.dns_health_rate,
    render: (value: number) => formatPercent(value),
  },
  {
    title: 'Blacklist',
    dataIndex: 'blacklist_total',
    key: 'blacklist_total',
    sorter: (a, b) => a.blacklist_total - b.blacklist_total,
    render: (value: number) => formatNumber(value),
  },
  {
    title: 'SSL Expire',
    dataIndex: 'ssl_expires_in_days',
    key: 'ssl_expires_in_days',
    sorter: (a, b) => (a.ssl_expires_in_days || 0) - (b.ssl_expires_in_days || 0),
    render: (value: number | null) => formatDaysToExpire(value),
  },
  {
    title: 'Quota',
    key: 'quota_usage',
    render: (_, record) =>
      `${formatPercent(record.quota_usage_rate)} (${formatQuota(record.current_usage, record.quota)})`,
  },
  {
    title: 'Фейлы',
    dataIndex: ['failed', 'total'],
    key: 'failed_total',
    sorter: (a, b) => a.failed.total - b.failed.total,
    render: (value: number) => formatNumber(value),
  },
  {
    title: 'Последняя задача',
    dataIndex: 'last_task_at',
    key: 'last_task_at',
    render: (value: number | null) => formatUnix(value),
  },
];

const mailboxColumns: ColumnsType<MailboxAnalyticsItem> = [
  {
    title: 'Отправитель',
    dataIndex: 'mailbox',
    key: 'mailbox',
    fixed: 'left',
    width: 260,
  },
  {
    title: 'Домен',
    dataIndex: 'domain',
    key: 'domain',
  },
  {
    title: 'Задач',
    dataIndex: 'tasks_total',
    key: 'tasks_total',
    sorter: (a, b) => a.tasks_total - b.tasks_total,
    render: (value: number) => formatNumber(value),
  },
  {
    title: 'Отправлено',
    dataIndex: 'sent_total',
    key: 'sent_total',
    sorter: (a, b) => a.sent_total - b.sent_total,
    render: (value: number) => formatNumber(value),
  },
  {
    title: 'Успешно',
    dataIndex: 'success_total',
    key: 'success_total',
    sorter: (a, b) => a.success_total - b.success_total,
    render: (value: number) => formatNumber(value),
  },
  {
    title: 'Ошибки',
    dataIndex: 'error_total',
    key: 'error_total',
    sorter: (a, b) => a.error_total - b.error_total,
    render: (value: number) => formatNumber(value),
  },
  {
    title: 'Success Rate',
    dataIndex: 'success_rate',
    key: 'success_rate',
    sorter: (a, b) => a.success_rate - b.success_rate,
    render: (value: number) => formatPercent(value),
  },
  {
    title: 'Completion',
    dataIndex: 'completion_rate',
    key: 'completion_rate',
    sorter: (a, b) => a.completion_rate - b.completion_rate,
    render: (value: number) => formatPercent(value),
  },
  {
    title: 'Quota',
    key: 'quota_usage',
    render: (_, record) =>
      `${formatPercent(record.quota_usage_rate)} (${formatQuota(record.used_quota, record.quota)})`,
  },
  {
    title: 'DNS Health',
    dataIndex: 'domain_dns_health_rate',
    key: 'domain_dns_health_rate',
    sorter: (a, b) => a.domain_dns_health_rate - b.domain_dns_health_rate,
    render: (value: number) => formatPercent(value),
  },
  {
    title: 'Фейлы',
    dataIndex: ['failed', 'total'],
    key: 'failed_total',
    sorter: (a, b) => a.failed.total - b.failed.total,
    render: (value: number) => formatNumber(value),
  },
  {
    title: 'Последняя задача',
    dataIndex: 'last_task_at',
    key: 'last_task_at',
    render: (value: number | null) => formatUnix(value),
  },
];

const topDomainColumns: ColumnsType<TopDomainMetric> = [
  {
    title: 'Домен',
    dataIndex: 'domain',
    key: 'domain',
  },
  {
    title: 'Отправлено',
    dataIndex: 'sent_total',
    key: 'sent_total',
    render: (value: number) => formatNumber(value),
  },
  {
    title: 'Ошибки',
    dataIndex: 'error_total',
    key: 'error_total',
    render: (value: number) => formatNumber(value),
  },
  {
    title: 'Success Rate',
    dataIndex: 'success_rate',
    key: 'success_rate',
    render: (value: number) => formatPercent(value),
  },
  {
    title: 'Failed',
    dataIndex: 'failed_total',
    key: 'failed_total',
    render: (value: number) => formatNumber(value),
  },
];

const topMailboxColumns: ColumnsType<TopMailboxMetric> = [
  {
    title: 'Отправитель',
    dataIndex: 'mailbox',
    key: 'mailbox',
  },
  {
    title: 'Отправлено',
    dataIndex: 'sent_total',
    key: 'sent_total',
    render: (value: number) => formatNumber(value),
  },
  {
    title: 'Ошибки',
    dataIndex: 'error_total',
    key: 'error_total',
    render: (value: number) => formatNumber(value),
  },
  {
    title: 'Success Rate',
    dataIndex: 'success_rate',
    key: 'success_rate',
    render: (value: number) => formatPercent(value),
  },
  {
    title: 'Quota Usage',
    dataIndex: 'quota_usage_rate',
    key: 'quota_usage_rate',
    render: (value: number) => formatPercent(value),
  },
  {
    title: 'Failed',
    dataIndex: 'failed_total',
    key: 'failed_total',
    render: (value: number) => formatNumber(value),
  },
];

export const SettingAnalytics = () => {
  const [range, setRange] = useState<[number, number]>([
    dayjs().subtract(30, 'day').startOf('day').unix(),
    dayjs().endOf('day').unix(),
  ]);

  const rangePickerValue = useMemo<RangePickerValue>(
    () => [dayjs.unix(range[0]), dayjs.unix(range[1])],
    [range]
  );

  const periodPayload = useMemo(
    () => ({
      start_time: range[0],
      end_time: range[1],
    }),
    [range]
  );

  const domainsAnalytics = useGetDomainsAnalytics(periodPayload);
  const mailboxesAnalytics = useGetMailboxesAnalytics(periodPayload);

  const domainData = domainsAnalytics.data;
  const mailboxData = mailboxesAnalytics.data;
  const isDomainsLoading =
    domainsAnalytics.isLoading || (!domainData && domainsAnalytics.isFetching);
  const isMailboxesLoading =
    mailboxesAnalytics.isLoading || (!mailboxData && mailboxesAnalytics.isFetching);

  const warnings = useMemo(() => {
    const combined = [...(domainData?.warnings || []), ...(mailboxData?.warnings || [])];
    return Array.from(new Set(combined));
  }, [domainData?.warnings, mailboxData?.warnings]);

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Space wrap align="center">
        <Typography.Text>
          Период: {dayjs.unix(range[0]).format('DD.MM.YYYY')} - {dayjs.unix(range[1]).format('DD.MM.YYYY')}
        </Typography.Text>

        <RangePicker
          value={rangePickerValue}
          allowClear={false}
          onChange={(value) => {
            if (!value || value.length !== 2 || !value[0] || !value[1]) {
              return;
            }

            setRange([value[0].startOf('day').unix(), value[1].endOf('day').unix()]);
          }}
        />

        <Button
          onClick={() => {
            domainsAnalytics.refetch();
            mailboxesAnalytics.refetch();
          }}
          loading={domainsAnalytics.isFetching || mailboxesAnalytics.isFetching}
        >
          Обновить
        </Button>
      </Space>

      {domainsAnalytics.isError || mailboxesAnalytics.isError ? (
        <Alert
          type="error"
          showIcon
          message="Не удалось загрузить аналитику"
          description="Проверьте доступ к API и повторите попытку"
        />
      ) : null}

      {warnings.length ? (
        <Space direction="vertical" size={8} style={{ width: '100%' }}>
          {warnings.map((warning) => (
            <Alert key={warning} type="warning" message={warning} showIcon />
          ))}
        </Space>
      ) : null}

      <Tabs
        items={[
          {
            key: 'domains',
            label: 'По доменам',
            children: (
              <Space direction="vertical" size={16} style={{ width: '100%' }}>
                <Row gutter={[12, 12]}>
                  <Col span={6}>
                    <Card loading={isDomainsLoading}>
                      <Statistic
                        title="Доменов"
                        value={domainData?.summary.domains_total || 0}
                        formatter={(value) => formatNumber(Number(value))}
                      />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card loading={isDomainsLoading}>
                      <Statistic
                        title="С отправками"
                        value={domainData?.summary.domains_with_tasks || 0}
                        formatter={(value) => formatNumber(Number(value))}
                      />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card loading={isDomainsLoading}>
                      <Statistic
                        title="Отправлено"
                        value={domainData?.summary.sent_total || 0}
                        formatter={(value) => formatNumber(Number(value))}
                      />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card loading={isDomainsLoading}>
                      <Statistic
                        title="Success Rate"
                        value={domainData?.summary.success_rate || 0}
                        suffix="%"
                        precision={2}
                      />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card loading={isDomainsLoading}>
                      <Statistic
                        title="Ошибки"
                        value={domainData?.summary.error_total || 0}
                        formatter={(value) => formatNumber(Number(value))}
                      />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card loading={isDomainsLoading}>
                      <Statistic
                        title="DNS Health (avg)"
                        value={domainData?.summary.average_dns_health_rate || 0}
                        suffix="%"
                        precision={2}
                      />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card loading={isDomainsLoading}>
                      <Statistic
                        title="Blacklisted"
                        value={domainData?.summary.blacklisted_domains || 0}
                        formatter={(value) => formatNumber(Number(value))}
                      />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card loading={isDomainsLoading}>
                      <Statistic
                        title="Quota Usage"
                        value={domainData?.summary.quota_usage_rate || 0}
                        suffix="%"
                        precision={2}
                      />
                    </Card>
                  </Col>
                </Row>

                <Card title="Топ домены по отправкам">
                  <Table<TopDomainMetric>
                    rowKey="domain"
                    columns={topDomainColumns}
                    dataSource={domainData?.top_domains_by_sent || []}
                    pagination={false}
                    loading={isDomainsLoading || domainsAnalytics.isFetching}
                  />
                </Card>

                <Card title="Аналитика доменов">
                  <Table<DomainAnalyticsItem>
                    rowKey="domain"
                    columns={domainColumns}
                    dataSource={domainData?.domains || []}
                    loading={isDomainsLoading || domainsAnalytics.isFetching}
                    scroll={{ x: 2200 }}
                    pagination={{
                      pageSize: 20,
                      showSizeChanger: true,
                      pageSizeOptions: ['10', '20', '50', '100'],
                    }}
                    locale={{ emptyText: <Empty description="Нет данных по доменам" /> }}
                  />
                </Card>

                <Card title="Дневная динамика по доменам">
                  <Table
                    rowKey="date"
                    pagination={false}
                    dataSource={domainData?.timeline_by_day || []}
                    loading={isDomainsLoading || domainsAnalytics.isFetching}
                    columns={[
                      { title: 'Дата', dataIndex: 'date', key: 'date' },
                      {
                        title: 'Задач',
                        dataIndex: 'tasks',
                        key: 'tasks',
                        render: (value: number) => formatNumber(value),
                      },
                      {
                        title: 'Отправлено',
                        dataIndex: 'sent_total',
                        key: 'sent_total',
                        render: (value: number) => formatNumber(value),
                      },
                      {
                        title: 'Успешно',
                        dataIndex: 'success_total',
                        key: 'success_total',
                        render: (value: number) => formatNumber(value),
                      },
                      {
                        title: 'Ошибки',
                        dataIndex: 'error_total',
                        key: 'error_total',
                        render: (value: number) => formatNumber(value),
                      },
                    ]}
                    locale={{ emptyText: <Empty description="Нет данных по динамике" /> }}
                  />
                </Card>
              </Space>
            ),
          },
          {
            key: 'mailboxes',
            label: 'По отправителям',
            children: (
              <Space direction="vertical" size={16} style={{ width: '100%' }}>
                <Row gutter={[12, 12]}>
                  <Col span={6}>
                    <Card loading={isMailboxesLoading}>
                      <Statistic
                        title="Mailbox"
                        value={mailboxData?.summary.mailboxes_total || 0}
                        formatter={(value) => formatNumber(Number(value))}
                      />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card loading={isMailboxesLoading}>
                      <Statistic
                        title="Активных mailbox"
                        value={mailboxData?.summary.active_mailboxes || 0}
                        formatter={(value) => formatNumber(Number(value))}
                      />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card loading={isMailboxesLoading}>
                      <Statistic
                        title="С отправками"
                        value={mailboxData?.summary.mailboxes_with_tasks || 0}
                        formatter={(value) => formatNumber(Number(value))}
                      />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card loading={isMailboxesLoading}>
                      <Statistic
                        title="Отправлено"
                        value={mailboxData?.summary.sent_total || 0}
                        formatter={(value) => formatNumber(Number(value))}
                      />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card loading={isMailboxesLoading}>
                      <Statistic
                        title="Success Rate"
                        value={mailboxData?.summary.success_rate || 0}
                        suffix="%"
                        precision={2}
                      />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card loading={isMailboxesLoading}>
                      <Statistic
                        title="Ошибки"
                        value={mailboxData?.summary.error_total || 0}
                        formatter={(value) => formatNumber(Number(value))}
                      />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card loading={isMailboxesLoading}>
                      <Statistic
                        title="Quota Usage"
                        value={mailboxData?.summary.quota_usage_rate || 0}
                        suffix="%"
                        precision={2}
                      />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card loading={isMailboxesLoading}>
                      <Statistic
                        title="Фейлы"
                        value={mailboxData?.summary.failed_events_total || 0}
                        formatter={(value) => formatNumber(Number(value))}
                      />
                    </Card>
                  </Col>
                </Row>

                <Card title="Топ отправители по отправкам">
                  <Table<TopMailboxMetric>
                    rowKey="mailbox"
                    columns={topMailboxColumns}
                    dataSource={mailboxData?.top_mailboxes_by_sent || []}
                    pagination={false}
                    loading={isMailboxesLoading || mailboxesAnalytics.isFetching}
                  />
                </Card>

                <Card title="Аналитика отправителей">
                  <Table<MailboxAnalyticsItem>
                    rowKey="mailbox"
                    columns={mailboxColumns}
                    dataSource={mailboxData?.mailboxes || []}
                    loading={isMailboxesLoading || mailboxesAnalytics.isFetching}
                    scroll={{ x: 2200 }}
                    pagination={{
                      pageSize: 20,
                      showSizeChanger: true,
                      pageSizeOptions: ['10', '20', '50', '100'],
                    }}
                    locale={{ emptyText: <Empty description="Нет данных по отправителям" /> }}
                  />
                </Card>

                <Card title="Дневная динамика по отправителям">
                  <Table
                    rowKey="date"
                    pagination={false}
                    dataSource={mailboxData?.timeline_by_day || []}
                    loading={isMailboxesLoading || mailboxesAnalytics.isFetching}
                    columns={[
                      { title: 'Дата', dataIndex: 'date', key: 'date' },
                      {
                        title: 'Задач',
                        dataIndex: 'tasks',
                        key: 'tasks',
                        render: (value: number) => formatNumber(value),
                      },
                      {
                        title: 'Отправлено',
                        dataIndex: 'sent_total',
                        key: 'sent_total',
                        render: (value: number) => formatNumber(value),
                      },
                      {
                        title: 'Успешно',
                        dataIndex: 'success_total',
                        key: 'success_total',
                        render: (value: number) => formatNumber(value),
                      },
                      {
                        title: 'Ошибки',
                        dataIndex: 'error_total',
                        key: 'error_total',
                        render: (value: number) => formatNumber(value),
                      },
                    ]}
                    locale={{ emptyText: <Empty description="Нет данных по динамике" /> }}
                  />
                </Card>
              </Space>
            ),
          },
        ]}
      />
    </Space>
  );
};

'use client';

import React, { useMemo } from 'react';
import { Alert, Card, Descriptions, Empty, Progress, Space, Typography } from 'antd';
import dayjs from 'dayjs';

import { BatchMailTaskType, useGetBatchMailTaskAnalytics } from '@/entities/mailer/api';

import { SViewMailingTaskAnalyticsModal } from './viewMailingTaskAnalytics.styles';

const DAY_IN_SECONDS = 86_400;

const DASHBOARD_LABELS: Record<string, string> = {
  sends: 'Отправлено',
  delivered: 'Доставлено',
  bounced: 'Ошибок доставки',
  opened: 'Открыто',
  clicked: 'Клики',
  delivery_rate: 'Процент доставки',
  bounce_rate: 'Процент ошибок',
  open_rate: 'Процент открытий',
  click_rate: 'Процент кликов',
};

const CHART_COLORS = ['#1677ff', '#13c2c2', '#fa8c16', '#52c41a', '#eb2f96', '#722ed1'];

const CHART_WIDTH = 920;
const CHART_HEIGHT = 260;
const CHART_PADDING = {
  top: 16,
  right: 20,
  bottom: 46,
  left: 52,
};

const CHART_LABEL_KEYS = ['label', 'name', 'time', 'date', 'x', 'key', 'timestamp', 'day', 'hour'];

const CHART_VALUE_KEYS = [
  'value',
  'count',
  'total',
  'sent',
  'opened',
  'clicked',
  'bounce',
  'y',
  'rate',
];

type ChartPoint = {
  label: string;
  value: number;
};

type ChartSeries = {
  name: string;
  points: ChartPoint[];
};

type ProviderStat = {
  name: string;
  value: number;
};

export interface ViewMailingTaskAnalyticsProps {
  task: BatchMailTaskType | null;
  open: boolean;
  onClose: () => void;
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const toNumber = (value: unknown): number | null => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const toString = (value: unknown): string => {
  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }

  return '';
};

const formatUnix = (value: number) => {
  if (!Number.isFinite(value) || value <= 0) {
    return '—';
  }

  return dayjs.unix(value).format('DD.MM.YYYY HH:mm:ss');
};

const formatDashboardValue = (key: string, value: unknown) => {
  if (typeof value === 'number') {
    if (key.endsWith('_rate')) {
      const percentValue = value <= 1 ? value * 100 : value;
      return `${percentValue.toFixed(2)}%`;
    }

    return value.toLocaleString('ru-RU');
  }

  if (typeof value === 'boolean') {
    return value ? 'Да' : 'Нет';
  }

  if (typeof value === 'string') {
    return value || '—';
  }

  return '—';
};

const firstArray = (source: Record<string, unknown>, keys: string[]): unknown[] | null => {
  for (const key of keys) {
    if (Array.isArray(source[key])) {
      return source[key] as unknown[];
    }
  }

  return null;
};

const extractLabels = (source: Record<string, unknown>): string[] | null => {
  const rawLabels = firstArray(source, [
    'labels',
    'xAxis',
    'x_axis',
    'times',
    'time',
    'dates',
    'categories',
    'x',
  ]);

  if (!rawLabels) {
    return null;
  }

  return rawLabels.map((item, index) => {
    const value = toString(item);
    return value || `Точка ${index + 1}`;
  });
};

const resolveValueFromObject = (source: Record<string, unknown>): number | null => {
  for (const key of CHART_VALUE_KEYS) {
    const value = toNumber(source[key]);
    if (value !== null) {
      return value;
    }
  }

  for (const [key, rawValue] of Object.entries(source)) {
    if (CHART_LABEL_KEYS.includes(key)) {
      continue;
    }

    const value = toNumber(rawValue);
    if (value !== null) {
      return value;
    }
  }

  return null;
};

const resolveLabelFromObject = (source: Record<string, unknown>, fallbackIndex: number): string => {
  for (const key of CHART_LABEL_KEYS) {
    const value = toString(source[key]).trim();
    if (value) {
      return value;
    }
  }

  return `Точка ${fallbackIndex + 1}`;
};

const pointsFromNumberArray = (values: number[], labels?: string[] | null): ChartPoint[] =>
  values
    .map((value, index) => ({
      label: labels?.[index] || `Точка ${index + 1}`,
      value,
    }))
    .filter((item) => Number.isFinite(item.value));

const pointsFromObjectArray = (
  values: Record<string, unknown>[],
  labels?: string[] | null
): ChartPoint[] =>
  values
    .map((item, index) => {
      const value = resolveValueFromObject(item);
      if (value === null) {
        return null;
      }

      return {
        label: labels?.[index] || resolveLabelFromObject(item, index),
        value,
      };
    })
    .filter((item): item is ChartPoint => item !== null);

const normalizeRawSeriesItem = (
  value: unknown,
  fallbackName: string,
  defaultLabels?: string[] | null
): ChartSeries | null => {
  if (Array.isArray(value)) {
    const numericValues = value
      .map((item) => toNumber(item))
      .filter((item): item is number => item !== null);

    if (numericValues.length === value.length && numericValues.length > 0) {
      return {
        name: fallbackName,
        points: pointsFromNumberArray(numericValues, defaultLabels),
      };
    }

    const objectValues = value.filter((item): item is Record<string, unknown> => isObject(item));
    if (objectValues.length === value.length && objectValues.length > 0) {
      return {
        name: fallbackName,
        points: pointsFromObjectArray(objectValues, defaultLabels),
      };
    }

    return null;
  }

  if (!isObject(value)) {
    return null;
  }

  const seriesName = toString(value.name).trim() || fallbackName;
  const labels = extractLabels(value) || defaultLabels;
  const dataArray = firstArray(value, ['data', 'values', 'points']);

  if (dataArray) {
    return normalizeRawSeriesItem(dataArray, seriesName, labels);
  }

  return null;
};

const normalizeChartSeries = (rawChart: unknown, defaultSeriesName: string, asPercent = false) => {
  const series: ChartSeries[] = [];

  if (Array.isArray(rawChart)) {
    const maybeSeriesItems = rawChart
      .map((item, index) => normalizeRawSeriesItem(item, `${defaultSeriesName} ${index + 1}`, null))
      .filter((item): item is ChartSeries => item !== null && item.points.length > 0);

    if (maybeSeriesItems.length) {
      series.push(...maybeSeriesItems);
    } else {
      const numericValues = rawChart
        .map((item) => toNumber(item))
        .filter((item): item is number => item !== null);

      if (numericValues.length === rawChart.length && numericValues.length > 0) {
        series.push({
          name: defaultSeriesName,
          points: pointsFromNumberArray(numericValues),
        });
      }
    }
  } else if (isObject(rawChart)) {
    const labels = extractLabels(rawChart);
    const seriesArray = firstArray(rawChart, ['series', 'datasets']);

    if (seriesArray) {
      const normalized = seriesArray
        .map((item, index) =>
          normalizeRawSeriesItem(item, `${defaultSeriesName} ${index + 1}`, labels)
        )
        .filter((item): item is ChartSeries => item !== null && item.points.length > 0);

      series.push(...normalized);
    } else {
      const dataArray = firstArray(rawChart, ['data', 'values', 'points']);

      if (dataArray) {
        const normalized = normalizeRawSeriesItem(dataArray, defaultSeriesName, labels);
        if (normalized && normalized.points.length > 0) {
          series.push(normalized);
        }
      } else {
        const numericEntries = Object.entries(rawChart)
          .map(([key, value]) => ({
            key,
            value: toNumber(value),
          }))
          .filter((item): item is { key: string; value: number } => item.value !== null);

        if (numericEntries.length > 0) {
          series.push({
            name: defaultSeriesName,
            points: numericEntries.map((item) => ({
              label: item.key,
              value: item.value,
            })),
          });
        }
      }
    }
  }

  const cleanedSeries = series
    .map((item) => ({
      ...item,
      points: item.points.filter((point) => Number.isFinite(point.value)),
    }))
    .filter((item) => item.points.length > 0);

  if (!asPercent || cleanedSeries.length === 0) {
    return cleanedSeries;
  }

  const maxValue = Math.max(
    ...cleanedSeries.flatMap((item) => item.points.map((point) => point.value))
  );

  if (maxValue <= 1) {
    return cleanedSeries.map((item) => ({
      ...item,
      points: item.points.map((point) => ({
        ...point,
        value: point.value * 100,
      })),
    }));
  }

  return cleanedSeries;
};

const normalizeProviderStats = (raw: unknown): ProviderStat[] => {
  const resolveProviderValue = (value: unknown): number | null => {
    if (!isObject(value)) {
      return toNumber(value);
    }

    const directValue =
      toNumber(value.count) ??
      toNumber(value.total) ??
      toNumber(value.value) ??
      toNumber(value.sent) ??
      toNumber(value.sends) ??
      toNumber(value.delivered);

    if (directValue !== null) {
      return directValue;
    }

    const success = toNumber(value.success);
    const fail = toNumber(value.fail) ?? toNumber(value.failure) ?? toNumber(value.bounced);

    if (success !== null || fail !== null) {
      return (success ?? 0) + (fail ?? 0);
    }

    const nestedArray = firstArray(value, [
      'list',
      'data',
      'items',
      'stats',
      'providers',
      'mail_providers',
      'provider_stats',
    ]);

    if (nestedArray) {
      const nestedStats = normalizeProviderStats(nestedArray);
      if (nestedStats.length) {
        return nestedStats.reduce((sum, item) => sum + item.value, 0);
      }
    }

    return null;
  };

  if (Array.isArray(raw)) {
    return raw
      .map((item, index) => {
        if (!isObject(item)) {
          return null;
        }

        const name =
          toString(item.mail_provider).trim() ||
          toString(item.provider).trim() ||
          toString(item.name).trim() ||
          `Провайдер ${index + 1}`;

        const value = resolveProviderValue(item);

        if (value === null) {
          return null;
        }

        return { name, value };
      })
      .filter((item): item is ProviderStat => item !== null);
  }

  if (isObject(raw)) {
    const list = firstArray(raw, [
      'list',
      'data',
      'items',
      'stats',
      'providers',
      'mail_providers',
      'provider_stats',
    ]);
    if (list) {
      return normalizeProviderStats(list);
    }

    return Object.entries(raw)
      .map(([name, value]) => {
        const numericValue = resolveProviderValue(value);
        if (numericValue === null) {
          return null;
        }

        return {
          name,
          value: numericValue,
        };
      })
      .filter((item): item is ProviderStat => item !== null);
  }

  return [];
};

const renderLineChart = (series: ChartSeries[], asPercent = false) => {
  if (!series.length) {
    return (
      <Empty description="Нет данных для построения графика" image={Empty.PRESENTED_IMAGE_SIMPLE} />
    );
  }

  const pointCount = Math.max(...series.map((item) => item.points.length));
  const values = series.flatMap((item) => item.points.map((point) => point.value));
  const maxValue = Math.max(...values, 1);

  const plotWidth = CHART_WIDTH - CHART_PADDING.left - CHART_PADDING.right;
  const plotHeight = CHART_HEIGHT - CHART_PADDING.top - CHART_PADDING.bottom;

  const xByIndex = (index: number) => {
    if (pointCount <= 1) {
      return CHART_PADDING.left;
    }

    return CHART_PADDING.left + (index / (pointCount - 1)) * plotWidth;
  };

  const yByValue = (value: number) =>
    CHART_PADDING.top + plotHeight - (Math.max(value, 0) / maxValue) * plotHeight;

  const yTicks = 4;
  const xTickCount = Math.min(pointCount, 6);

  const xTickIndexes = Array.from({ length: xTickCount }, (_, index) => {
    if (xTickCount === 1 || pointCount <= 1) {
      return 0;
    }

    return Math.round((index * (pointCount - 1)) / (xTickCount - 1));
  }).filter((value, index, arr) => arr.indexOf(value) === index);

  const primaryLabels = series[0]?.points.map((point) => point.label) || [];

  return (
    <Space direction="vertical" size={12} style={{ width: '100%' }}>
      <Space wrap size={12}>
        {series.map((item, index) => (
          <Space key={item.name} size={6}>
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: CHART_COLORS[index % CHART_COLORS.length],
                display: 'inline-block',
              }}
            />
            <Typography.Text>{item.name}</Typography.Text>
          </Space>
        ))}
      </Space>

      <svg
        viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
        width="100%"
        height="260"
        role="img"
        aria-label="График аналитики"
      >
        <line
          x1={CHART_PADDING.left}
          y1={CHART_PADDING.top + plotHeight}
          x2={CHART_PADDING.left + plotWidth}
          y2={CHART_PADDING.top + plotHeight}
          stroke="#d9d9d9"
        />
        <line
          x1={CHART_PADDING.left}
          y1={CHART_PADDING.top}
          x2={CHART_PADDING.left}
          y2={CHART_PADDING.top + plotHeight}
          stroke="#d9d9d9"
        />

        {Array.from({ length: yTicks + 1 }, (_, index) => {
          const value = (maxValue * index) / yTicks;
          const y = yByValue(value);

          return (
            <g key={`y-${index}`}>
              <line
                x1={CHART_PADDING.left}
                y1={y}
                x2={CHART_PADDING.left + plotWidth}
                y2={y}
                stroke="#f0f0f0"
              />
              <text
                x={CHART_PADDING.left - 8}
                y={y + 4}
                textAnchor="end"
                fontSize="11"
                fill="#8c8c8c"
              >
                {asPercent ? `${value.toFixed(0)}%` : value.toFixed(0)}
              </text>
            </g>
          );
        })}

        {xTickIndexes.map((index) => {
          const x = xByIndex(index);
          const label = primaryLabels[index] || `Точка ${index + 1}`;

          return (
            <g key={`x-${index}`}>
              <line
                x1={x}
                y1={CHART_PADDING.top + plotHeight}
                x2={x}
                y2={CHART_PADDING.top + plotHeight + 4}
                stroke="#d9d9d9"
              />
              <text
                x={x}
                y={CHART_PADDING.top + plotHeight + 18}
                textAnchor="middle"
                fontSize="11"
                fill="#8c8c8c"
              >
                {label}
              </text>
            </g>
          );
        })}

        {series.map((item, index) => {
          const color = CHART_COLORS[index % CHART_COLORS.length];
          const points = item.points.map(
            (point, pointIndex) => `${xByIndex(pointIndex)},${yByValue(point.value)}`
          );

          return (
            <g key={item.name}>
              <polyline fill="none" stroke={color} strokeWidth="2" points={points.join(' ')} />
              {item.points.map((point, pointIndex) => (
                <circle
                  key={`${item.name}-${pointIndex}`}
                  cx={xByIndex(pointIndex)}
                  cy={yByValue(point.value)}
                  r="3"
                  fill={color}
                />
              ))}
            </g>
          );
        })}
      </svg>
    </Space>
  );
};

export const ViewMailingTaskAnalytics = ({
  task,
  open,
  onClose,
}: ViewMailingTaskAnalyticsProps) => {
  const period = useMemo(() => {
    const now = dayjs().unix();
    const fallbackStart = now - DAY_IN_SECONDS;
    const start =
      task && Number.isFinite(task.start_time) && task.start_time > 0
        ? task.start_time
        : task && Number.isFinite(task.create_time) && task.create_time > 0
          ? task.create_time
          : fallbackStart;
    const end = now >= start ? now : start;

    return { start, end };
  }, [task?.id, task?.start_time, task?.create_time]);

  const analyticsPayload = useMemo(
    () => ({
      task_id: task?.id ?? 0,
      start_time: period.start,
      end_time: period.end,
    }),
    [task?.id, period.start, period.end]
  );

  const analytics = useGetBatchMailTaskAnalytics(analyticsPayload);
  const isInitialLoading = analytics.isLoading || (!analytics.data && analytics.isFetching);

  const dashboardEntries = useMemo(() => {
    const dashboard = analytics.data?.stat_chart?.dashboard || {};

    return Object.entries(dashboard).filter((entry) => {
      const value = entry[1];
      const isPrimitive =
        typeof value === 'number' || typeof value === 'string' || typeof value === 'boolean';

      return isPrimitive;
    });
  }, [analytics.data?.stat_chart?.dashboard]);

  const providerStats = useMemo(
    () => normalizeProviderStats(analytics.data?.mail_provider),
    [analytics.data?.mail_provider]
  );

  const sendChartSeries = useMemo(
    () => normalizeChartSeries(analytics.data?.stat_chart?.send_mail_chart, 'Отправки'),
    [analytics.data?.stat_chart?.send_mail_chart]
  );

  const bounceChartSeries = useMemo(
    () =>
      normalizeChartSeries(analytics.data?.stat_chart?.bounce_rate_chart, 'Процент ошибок', true),
    [analytics.data?.stat_chart?.bounce_rate_chart]
  );

  const openChartSeries = useMemo(
    () =>
      normalizeChartSeries(analytics.data?.stat_chart?.open_rate_chart, 'Процент открытий', true),
    [analytics.data?.stat_chart?.open_rate_chart]
  );

  const clickChartSeries = useMemo(
    () =>
      normalizeChartSeries(analytics.data?.stat_chart?.click_rate_chart, 'Процент кликов', true),
    [analytics.data?.stat_chart?.click_rate_chart]
  );

  const maxProviderValue = useMemo(() => {
    if (!providerStats.length) {
      return 0;
    }

    return Math.max(...providerStats.map((item) => item.value), 0);
  }, [providerStats]);

  return (
    <SViewMailingTaskAnalyticsModal
      open={open}
      onCancel={onClose}
      title={task ? `Аналитика задачи #${task.id}` : 'Аналитика задачи'}
    >
      {task ? (
        <Descriptions column={2} size="small" bordered>
          <Descriptions.Item label="Тема">{task.subject || '—'}</Descriptions.Item>
          <Descriptions.Item label="Отправитель">{task.addresser || '—'}</Descriptions.Item>
          <Descriptions.Item label="Группа">
            {task.group_name || `#${task.group_id}`}
          </Descriptions.Item>
          <Descriptions.Item label="Запланирован старт">
            {formatUnix(task.start_time)}
          </Descriptions.Item>
          <Descriptions.Item label="Шаблон ID">{task.template_id}</Descriptions.Item>
          <Descriptions.Item label="Период аналитики">
            {`${formatUnix(period.start)} - ${formatUnix(period.end)}`}
          </Descriptions.Item>
        </Descriptions>
      ) : null}

      {analytics.data?.warnings?.length ? (
        <Space direction="vertical" size={8} style={{ width: '100%' }}>
          {analytics.data.warnings.map((warning) => (
            <Alert key={warning} type="warning" showIcon message={warning} />
          ))}
        </Space>
      ) : null}

      {analytics.isError ? (
        <Typography.Text type="danger">Не удалось загрузить аналитику задачи</Typography.Text>
      ) : null}

      <Card title="Сводная аналитика" loading={isInitialLoading}>
        {dashboardEntries.length ? (
          <Descriptions column={2} size="small">
            {dashboardEntries.map(([key, value]) => (
              <Descriptions.Item key={key} label={DASHBOARD_LABELS[key] || key}>
                {formatDashboardValue(key, value)}
              </Descriptions.Item>
            ))}
          </Descriptions>
        ) : analytics.isFetching ? (
          <Typography.Text type="secondary">Загрузка...</Typography.Text>
        ) : (
          <Empty description="Сводная аналитика недоступна" />
        )}
      </Card>

      <Card title="Графики задачи" loading={isInitialLoading}>
        <Space direction="vertical" size={24} style={{ width: '100%' }}>
          <div>
            <Typography.Text strong>Динамика отправок</Typography.Text>
            {sendChartSeries.length ? (
              renderLineChart(sendChartSeries)
            ) : analytics.isFetching ? (
              <Typography.Text type="secondary">Загрузка...</Typography.Text>
            ) : (
              <Empty description="Нет данных по отправкам" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </div>

          <div>
            <Typography.Text strong>Динамика процента ошибок</Typography.Text>
            {bounceChartSeries.length ? (
              renderLineChart(bounceChartSeries, true)
            ) : analytics.isFetching ? (
              <Typography.Text type="secondary">Загрузка...</Typography.Text>
            ) : (
              <Empty
                description="Нет данных по проценту ошибок"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </div>

          <div>
            <Typography.Text strong>Динамика процента открытий</Typography.Text>
            {openChartSeries.length ? (
              renderLineChart(openChartSeries, true)
            ) : analytics.isFetching ? (
              <Typography.Text type="secondary">Загрузка...</Typography.Text>
            ) : (
              <Empty
                description="Нет данных по проценту открытий"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </div>

          <div>
            <Typography.Text strong>Динамика процента кликов</Typography.Text>
            {clickChartSeries.length ? (
              renderLineChart(clickChartSeries, true)
            ) : analytics.isFetching ? (
              <Typography.Text type="secondary">Загрузка...</Typography.Text>
            ) : (
              <Empty
                description="Нет данных по проценту кликов"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </div>
        </Space>
      </Card>
    </SViewMailingTaskAnalyticsModal>
  );
};

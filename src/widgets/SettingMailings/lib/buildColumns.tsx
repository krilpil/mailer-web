import { Button, TableProps } from 'antd';
import { unix } from 'dayjs';

import { BatchMailTaskType } from '@/entities/mailer/api';

const formatUnix = (value: number) => {
  if (!Number.isFinite(value) || value <= 0) {
    return '—';
  }

  return unix(value).format('DD MMM YYYY HH:mm');
};

const formatDuration = (value: number) => {
  if (!Number.isFinite(value) || value <= 0) {
    return '—';
  }

  const totalSeconds = Math.floor(value);
  const days = Math.floor(totalSeconds / 86_400);
  const hours = Math.floor((totalSeconds % 86_400) / 3_600);
  const minutes = Math.floor((totalSeconds % 3_600) / 60);
  const seconds = totalSeconds % 60;

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}д`);
  if (hours > 0) parts.push(`${hours}ч`);
  if (minutes > 0) parts.push(`${minutes}м`);
  if (seconds > 0 && days === 0) parts.push(`${seconds}с`);
  if (parts.length === 0) parts.push('0с');

  return parts.join(' ');
};

type BuildMailingTasksColumns = (args: {
  onOpenAnalytics: (task: BatchMailTaskType) => void;
}) => TableProps<BatchMailTaskType>['columns'];

export const buildMailingTasksColumns: BuildMailingTasksColumns = ({ onOpenAnalytics }) => [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
    width: 90,
  },
  {
    title: 'Тема',
    dataIndex: 'subject',
    key: 'subject',
    ellipsis: true,
  },
  {
    title: 'Отправитель',
    dataIndex: 'addresser',
    key: 'addresser',
  },
  {
    title: 'Группа',
    dataIndex: 'group_name',
    key: 'group_name',
    render: (groupName: string, task: BatchMailTaskType) => groupName || `#${task.group_id}`,
  },
  {
    title: 'Прогресс',
    dataIndex: 'progress',
    key: 'progress',
    render: (progress: number) => `${progress}%`,
  },
  {
    title: 'Расчетное время',
    dataIndex: 'estimated_time_with_warmup',
    key: 'estimated_time_with_warmup',
    width: 140,
    render: (value: number) => formatDuration(value),
  },
  {
    title: 'Получателей',
    dataIndex: 'recipient_count',
    key: 'recipient_count',
  },
  {
    title: 'Успешно',
    dataIndex: 'success_count',
    key: 'success_count',
  },
  {
    title: 'Ошибок',
    dataIndex: 'error_count',
    key: 'error_count',
  },
  {
    title: 'Старт',
    dataIndex: 'start_time',
    key: 'start_time',
    render: (startTime: number) => formatUnix(startTime),
  },
  {
    title: 'Создана',
    dataIndex: 'create_time',
    key: 'create_time',
    render: (createTime: number) => formatUnix(createTime),
  },
  {
    key: 'analytics',
    width: 130,
    render: (task: BatchMailTaskType) => (
      <Button type="dashed" onClick={() => onOpenAnalytics(task)}>
        Аналитика
      </Button>
    ),
  },
];

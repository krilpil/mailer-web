import { Button, TableProps } from 'antd';
import { unix } from 'dayjs';

import { UserTemplateType } from '@/entities/mailer/api';

type BuildTemplatesColumns = (args: {
  deletingTemplateId: number | null;
  onRemove: (templateId: number) => void;
}) => TableProps<UserTemplateType>['columns'];

const formatUnix = (value: number) => {
  if (!Number.isFinite(value) || value <= 0) {
    return '—';
  }

  return unix(value).format('DD MMM YYYY HH:mm');
};

export const buildTemplatesColumns: BuildTemplatesColumns = ({ deletingTemplateId, onRemove }) => [
  {
    title: 'ID шаблона',
    dataIndex: 'template_id',
    key: 'template_id',
    width: 120,
  },
  {
    title: 'Название',
    dataIndex: 'template_name',
    key: 'template_name',
    ellipsis: true,
  },
  {
    title: 'Создан',
    dataIndex: 'create_time',
    key: 'create_time',
    width: 170,
    render: (createTime: number) => formatUnix(createTime),
  },
  {
    title: 'Обновлен',
    dataIndex: 'update_time',
    key: 'update_time',
    width: 170,
    render: (updateTime: number) => formatUnix(updateTime),
  },
  {
    key: 'remove',
    width: 120,
    render: ({ template_id }: UserTemplateType) => (
      <Button
        type="dashed"
        danger
        loading={deletingTemplateId === template_id}
        onClick={() => onRemove(template_id)}
      >
        Удалить
      </Button>
    ),
  },
];

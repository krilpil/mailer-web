import { Button, Popconfirm, Space, TableProps } from 'antd';

import { ContactGroupType } from '@/entities/contact';

type BuilderGroupsColumns = (args: {
  onShowRecipients: (group: ContactGroupType) => void;
  onRemove: (group: ContactGroupType) => void;
  deletingGroupId: number | null;
}) => TableProps<ContactGroupType>['columns'];

export const buildGroupsColumns: BuilderGroupsColumns = ({
  onShowRecipients,
  onRemove,
  deletingGroupId,
}) => [
  {
    title: 'Идентификатор группы',
    dataIndex: 'group_id',
    key: 'group_id',
  },
  {
    title: 'Название',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'Пользователей',
    dataIndex: 'recipients_count',
    key: 'recipients_count',
    render: (value: number) => `${value} шт.`,
  },
  {
    key: 'show_recipients',
    render: (group: ContactGroupType) => (
      <Space>
        <Button type="primary" onClick={() => onShowRecipients(group)}>
          Пользователи
        </Button>

        <Popconfirm
          title="Удалить группу?"
          description="Группа и все пользователи группы будут удалены"
          okText="Удалить"
          cancelText="Отмена"
          onConfirm={() => onRemove(group)}
        >
          <Button type="dashed" danger loading={deletingGroupId === group.group_id}>
            Удалить
          </Button>
        </Popconfirm>
      </Space>
    ),
  },
];

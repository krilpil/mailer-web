import dayjs from 'dayjs';
import { Button, Popconfirm, Tag, TableProps } from 'antd';

import { ContactRecipientType } from '@/entities/contact';

type BuildRecipientsColumns = (args: {
  onRemoveFromGroup: (contact: ContactRecipientType) => void;
  removingEmail: string | null;
}) => TableProps<ContactRecipientType>['columns'];

export const buildRecipientsColumns: BuildRecipientsColumns = ({
  onRemoveFromGroup,
  removingEmail,
}) => [
  {
    title: 'Email',
    dataIndex: 'email',
    key: 'email',
  },
  {
    title: 'Подписка',
    dataIndex: 'active',
    key: 'active',
    render: (active: 0 | 1) =>
      active === 1 ? <Tag color="green">Подписан</Tag> : <Tag color="default">Отписан</Tag>,
  },
  {
    title: 'Подтверждение',
    dataIndex: 'status',
    key: 'status',
    render: (status: 0 | 1) =>
      status === 1 ? (
        <Tag color="blue">Подтвержден</Tag>
      ) : (
        <Tag color="default">Не подтвержден</Tag>
      ),
  },
  {
    title: 'Добавлен',
    dataIndex: 'create_time',
    key: 'create_time',
    render: (createTime: number) =>
      createTime > 0 ? dayjs.unix(createTime).format('DD MMMM YYYY в HH:mm') : '-',
  },
  {
    key: 'remove_from_group',
    render: (contact: ContactRecipientType) => (
      <Popconfirm
        title="Удалить пользователя из группы?"
        okText="Удалить"
        cancelText="Отмена"
        onConfirm={() => onRemoveFromGroup(contact)}
      >
        <Button type="dashed" danger loading={removingEmail === contact.email}>
          Удалить из группы
        </Button>
      </Popconfirm>
    ),
  },
];

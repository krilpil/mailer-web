import { Button, TableProps } from 'antd';
import { unix } from 'dayjs';

import { MailboxType } from '@/entities/mailbox';

type IBuilderMailboxesColumns = (args: {
  onRemove: (username: string) => void;
}) => TableProps<MailboxType>['columns'];

export const builderMailboxesColumns: IBuilderMailboxesColumns = ({ onRemove }) => [
  {
    title: 'Почтовый адрес',
    dataIndex: 'username',
    key: 'username',
  },
  {
    title: 'Добавлен',
    dataIndex: 'create_time',
    key: 'create_time',
    render: (createTime: number) => unix(createTime).format('DD MMMM YYYY в HH:mm'),
  },
  {
    key: 'remove',
    render: ({ username }: MailboxType) => (
      <Button type="dashed" onClick={() => onRemove(username)}>
        Удалить
      </Button>
    ),
  },
];

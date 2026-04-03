import React from 'react';
import { Table } from 'antd';

import { useDeleteMailbox, useGetMailboxesList } from '@/entities/mailbox/api';

import { builderMailboxesColumns } from '../lib/builderColumn';

export const SettingMailboxes = () => {
  const mailboxesList = useGetMailboxesList();
  const deleteMailbox = useDeleteMailbox();
  const tableDataSource = mailboxesList.data || [];
  const handleDeleteMailbox = (username: string) => {
    deleteMailbox.mutateAsync({ username });
  };
  const columns = builderMailboxesColumns({ onRemove: handleDeleteMailbox });

  return (
    <Table
      rowKey="username"
      columns={columns}
      dataSource={tableDataSource}
      pagination={false}
      loading={mailboxesList.isFetching}
      scroll={{ x: 720 }}
    />
  );
};

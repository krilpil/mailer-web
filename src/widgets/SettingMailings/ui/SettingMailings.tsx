'use client';

import React, { useMemo, useState } from 'react';
import { Button, Input, Space, Table, Typography } from 'antd';

import { BatchMailTaskType, useGetBatchMailTasksList } from '@/entities/mailer/api';
import { CreateMailingTask } from '@/features/CreateMailingTask';
import { ViewMailingTaskAnalytics } from '@/features/ViewMailingTaskAnalytics';

import { buildMailingTasksColumns } from '../lib/buildColumns';

const pageSizeOptions = ['10', '20', '50', '100'];

export const SettingMailings = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [keywordInput, setKeywordInput] = useState('');
  const [keyword, setKeyword] = useState('');
  const [analyticsTask, setAnalyticsTask] = useState<BatchMailTaskType | null>(null);

  const taskList = useGetBatchMailTasksList({
    page,
    page_size: pageSize,
    keyword: keyword || undefined,
  });

  const columns = useMemo(
    () =>
      buildMailingTasksColumns({
        onOpenAnalytics: (task) => setAnalyticsTask(task),
      }),
    []
  );

  const dataSource = taskList.data?.list || [];
  const total = taskList.data?.total || 0;

  const handleSearch = () => {
    setPage(1);
    setKeyword(keywordInput.trim());
  };

  const handleReset = () => {
    setPage(1);
    setKeyword('');
    setKeywordInput('');
  };

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Space wrap>
        <CreateMailingTask
          onCreated={async () => {
            await taskList.refetch();
          }}
        />

        <Input.Search
          placeholder="Поиск по теме"
          value={keywordInput}
          onChange={(event) => setKeywordInput(event.target.value)}
          onSearch={handleSearch}
          enterButton="Искать"
          allowClear
          style={{ width: 'min(100%, 360px)' }}
        />

        <Button onClick={handleReset}>Сбросить</Button>
      </Space>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={dataSource}
        loading={taskList.isFetching}
        scroll={{ x: 1200 }}
        pagination={{
          current: page,
          pageSize,
          total,
          showSizeChanger: true,
          pageSizeOptions,
          showTotal: (value) => `Всего задач: ${value}`,
          onChange: (nextPage, nextPageSize) => {
            setPage(nextPage);
            setPageSize(nextPageSize);
          },
        }}
      />

      {taskList.isError ? (
        <Typography.Text type="danger">Не удалось загрузить список рассылок</Typography.Text>
      ) : null}

      <ViewMailingTaskAnalytics
        task={analyticsTask}
        open={!!analyticsTask}
        onClose={() => setAnalyticsTask(null)}
      />
    </Space>
  );
};

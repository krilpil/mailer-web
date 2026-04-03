'use client';

import React, { useMemo, useState } from 'react';
import { Table, Typography } from 'antd';

import { useDeleteUserTemplate, useGetUserTemplatesList } from '@/entities/mailer/api';

import { buildTemplatesColumns } from '../lib/buildColumns';

export const SettingTemplates = () => {
  const templatesList = useGetUserTemplatesList();
  const deleteUserTemplate = useDeleteUserTemplate();

  const [deletingTemplateId, setDeletingTemplateId] = useState<number | null>(null);

  const handleDeleteTemplate = async (templateId: number) => {
    setDeletingTemplateId(templateId);

    try {
      await deleteUserTemplate.mutateAsync({ template_id: templateId });
    } finally {
      setDeletingTemplateId(null);
    }
  };

  const columns = useMemo(
    () =>
      buildTemplatesColumns({
        deletingTemplateId,
        onRemove: handleDeleteTemplate,
      }),
    [deletingTemplateId]
  );

  return (
    <>
      <Table
        rowKey="template_id"
        columns={columns}
        dataSource={templatesList.data || []}
        pagination={false}
        loading={templatesList.isFetching}
        scroll={{ x: 880 }}
      />

      {templatesList.isError ? (
        <Typography.Text type="danger">Не удалось загрузить список шаблонов</Typography.Text>
      ) : null}
    </>
  );
};

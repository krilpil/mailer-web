'use client';

import React, { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { Button, Form, Select, Typography } from 'antd';

import { useGetContactGroupsList } from '@/entities/contact/api';
import { useGetMailboxesList } from '@/entities/mailbox/api';
import { useCreateBatchMailTask, useGetUserTemplatesList } from '@/entities/mailer/api';

import { SCreateMailingTaskModal } from './createMailingTask.styles';

const DEFAULT_THREADS = 5;

type CreateMailingTaskFormValues = {
  addresser: string;
  group_ids: number[];
  template_id: number;
};

export interface CreateMailingTaskProps {
  onCreated?: () => void | Promise<void>;
}

export const CreateMailingTask = ({ onCreated }: CreateMailingTaskProps) => {
  const [open, setOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [form] = Form.useForm<CreateMailingTaskFormValues>();

  const mailboxesList = useGetMailboxesList();
  const contactGroupsList = useGetContactGroupsList();
  const templatesList = useGetUserTemplatesList();
  const createBatchMailTask = useCreateBatchMailTask();

  const mailboxOptions = useMemo(
    () =>
      (mailboxesList.data || []).map((mailbox) => ({
        value: mailbox.username,
        label: mailbox.username,
      })),
    [mailboxesList.data]
  );

  const groupOptions = useMemo(
    () =>
      (contactGroupsList.data || []).map((group) => ({
        value: group.group_id,
        label: `${group.name} (${group.recipients_count})`,
      })),
    [contactGroupsList.data]
  );

  const templateOptions = useMemo(
    () =>
      (templatesList.data || []).map((template) => ({
        value: template.template_id,
        label: `${template.template_name} (#${template.template_id})`,
      })),
    [templatesList.data]
  );

  const isSubmitting = createBatchMailTask.isPending;

  const handleOpen = () => {
    setSubmitError(null);
    setOpen(true);
  };

  const handleClose = () => {
    setSubmitError(null);
    setOpen(false);
    form.resetFields();
  };

  const handleSubmit = async (values: CreateMailingTaskFormValues) => {
    setSubmitError(null);

    const selectedTemplate = (templatesList.data || []).find(
      (template) => template.template_id === values.template_id
    );

    if (!selectedTemplate) {
      setSubmitError('Шаблон не найден');
      return;
    }

    const normalizedGroupIds = Array.from(
      new Set(
        (values.group_ids || [])
          .map((groupId) => Number(groupId))
          .filter((groupId) => Number.isInteger(groupId) && groupId > 0)
      )
    );

    if (!normalizedGroupIds.length) {
      setSubmitError('Выберите хотя бы одну группу');
      return;
    }

    const startTime = dayjs().unix();
    let createdTasksCount = 0;

    try {
      for (const groupId of normalizedGroupIds) {
        await createBatchMailTask.mutateAsync({
          addresser: values.addresser,
          subject: selectedTemplate.template_name,
          template_id: values.template_id,
          group_id: groupId,
          start_time: startTime,
          full_name: values.addresser.split('@')[0],
          is_record: 1,
          unsubscribe: 1,
          threads: DEFAULT_THREADS,
          track_open: 1,
          track_click: 1,
          warmup: 1,
        });

        createdTasksCount += 1;
      }

      await onCreated?.();
      handleClose();
    } catch {
      setSubmitError(
        createdTasksCount > 0
          ? `Создано задач: ${createdTasksCount}. Остальные создать не удалось.`
          : 'Не удалось создать задачу рассылки'
      );
    }
  };

  return (
    <div>
      <SCreateMailingTaskModal open={open} onCancel={handleClose}>
        <Form layout="vertical" form={form} onFinish={handleSubmit}>
          <Form.Item
            name="addresser"
            label="Почтовый ящик отправителя"
            rules={[{ required: true, message: 'Выберите отправителя' }]}
          >
            <Select
              placeholder="Выберите отправителя"
              options={mailboxOptions}
              loading={mailboxesList.isFetching}
              optionFilterProp="label"
              showSearch
            />
          </Form.Item>

          <Form.Item
            name="group_ids"
            label="Группы получателей"
            rules={[{ required: true, message: 'Выберите одну или несколько групп' }]}
          >
            <Select<number[]>
              mode="multiple"
              placeholder="Выберите группы"
              options={groupOptions}
              loading={contactGroupsList.isFetching}
              optionFilterProp="label"
              showSearch
            />
          </Form.Item>

          <Form.Item
            name="template_id"
            label="Шаблон письма"
            rules={[{ required: true, message: 'Выберите шаблон' }]}
          >
            <Select
              placeholder="Выберите шаблон"
              options={templateOptions}
              loading={templatesList.isFetching}
              optionFilterProp="label"
              showSearch
            />
          </Form.Item>

          {submitError ? (
            <Typography.Text type="danger" style={{ marginBottom: 12, display: 'block' }}>
              {submitError}
            </Typography.Text>
          ) : null}

          <Button type="primary" htmlType="submit" loading={isSubmitting}>
            Запустить рассылку
          </Button>
        </Form>
      </SCreateMailingTaskModal>

      <Button type="primary" onClick={handleOpen}>
        Новая рассылка
      </Button>
    </div>
  );
};

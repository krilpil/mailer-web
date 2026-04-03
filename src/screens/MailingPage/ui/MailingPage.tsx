'use client';

import React, { useState } from 'react';
import { JSONContent } from '@tiptap/react';
import { Button, Typography } from 'antd';

import { MailerEditor } from '@/widgets/MailerEditor';
import { useCreateUserTemplate } from '@/entities/mailer/api';

import { SMailingPage, SMetaContent } from './mailingPage.styles';

const defaultContent: JSONContent = { type: 'doc', content: [{ type: 'paragraph' }] };

type SendResult = {
  type: 'success' | 'error';
  message: string;
};

export const MailingPage = () => {
  const createUserTemplate = useCreateUserTemplate();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState<JSONContent>(defaultContent);
  const [saveResult, setSaveResult] = useState<SendResult | null>(null);

  const normalizedTitle = title.trim();
  const disableSaveButton = !normalizedTitle;

  const handleCreateTemplate = async () => {
    setSaveResult(null);

    try {
      const response = await createUserTemplate.mutateAsync({
        template_name: normalizedTitle,
        content,
      });

      const savedTemplateId = response.data?.template_id;
      const successMessage = savedTemplateId
        ? `Шаблон сохранен (идентификатор: ${savedTemplateId})`
        : 'Шаблон сохранен';

      setSaveResult({
        type: 'success',
        message: successMessage,
      });
    } catch {
      setSaveResult({
        type: 'error',
        message: 'Не удалось сохранить шаблон',
      });
    }
  };

  return (
    <SMailingPage>
      <Typography.Title level={3}>Новый шаблон</Typography.Title>

      <MailerEditor
        title={title}
        content={content}
        onUpdateTitle={setTitle}
        onUpdateContent={setContent}
      />

      <SMetaContent>
        <Button
          onClick={handleCreateTemplate}
          loading={createUserTemplate.isPending}
          disabled={disableSaveButton}
          type={'primary'}
        >
          Сохранить шаблон
        </Button>

        {saveResult ? (
          <Typography.Text type={saveResult.type === 'error' ? 'danger' : 'success'}>
            {saveResult.message}
          </Typography.Text>
        ) : null}
      </SMetaContent>
    </SMailingPage>
  );
};

'use client';

import React, { useMemo, useState } from 'react';
import { Button, Form, Input, Typography } from 'antd';

import {
  buildMergedRecipientsNote,
  ContactImportExtension,
  IMPORT_FILE_PREVIEW_FALLBACK_NOTE,
  IMPORT_RECIPIENTS_EMPTY_ERROR,
  isEmail,
  parseRecipients,
  prepareRecipientsImportFilePayload,
  previewRecipientsImportFile,
  RecipientsImportFileInput,
  shouldImportFileAfterPreview,
} from '@/entities/contact';
import { useCreateContactGroup, useImportContactGroupRecipients } from '@/entities/contact/api';

import { SCreateContactGroupModal } from './createContactGroup.styles';

type CreateContactGroupFormValues = {
  name: string;
  recipients?: string;
};

export const CreateContactGroup = () => {
  const [open, setOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importFileExtension, setImportFileExtension] = useState<ContactImportExtension | null>(
    null
  );
  const [importFileMergedCount, setImportFileMergedCount] = useState(0);
  const [importFileMergeNote, setImportFileMergeNote] = useState<string | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [form] = Form.useForm<CreateContactGroupFormValues>();

  const createContactGroup = useCreateContactGroup();
  const importContactGroupRecipients = useImportContactGroupRecipients();

  const isSubmitting = useMemo(
    () => createContactGroup.isPending || importContactGroupRecipients.isPending,
    [createContactGroup.isPending, importContactGroupRecipients.isPending]
  );

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setSubmitError(null);
    setImportFile(null);
    setImportFileExtension(null);
    setImportFileMergedCount(0);
    setImportFileMergeNote(null);
    setFileInputKey((prev) => prev + 1);
    form.resetFields();
  };

  const handleImportFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setImportFileMergeNote(null);
    setImportFileMergedCount(0);

    if (!file) {
      setImportFile(null);
      setImportFileExtension(null);
      return;
    }

    const previewResult = await previewRecipientsImportFile({
      file,
      currentRecipients: form.getFieldValue('recipients') || '',
    });

    if (previewResult.error) {
      setImportFile(null);
      setImportFileExtension(null);
      setSubmitError(previewResult.error);
      return;
    }

    setSubmitError(null);
    setImportFile(file);
    setImportFileExtension(previewResult.extension ?? null);

    if (typeof previewResult.mergedRecipientsText === 'string') {
      form.setFieldValue('recipients', previewResult.mergedRecipientsText);
    }

    setImportFileMergedCount(previewResult.mergedCount);
    if (previewResult.note) {
      setImportFileMergeNote(previewResult.note);
      return;
    }

    if (previewResult.mergedCount > 0) {
      setImportFileMergeNote(buildMergedRecipientsNote(previewResult.mergedCount));
      return;
    }

    setImportFileMergeNote(IMPORT_FILE_PREVIEW_FALLBACK_NOTE);
  };

  const handleSubmit = async (values: CreateContactGroupFormValues) => {
    setSubmitError(null);

    const recipients = parseRecipients(values.recipients || '').filter(isEmail);
    let fileImportPayload: Awaited<
      ReturnType<typeof prepareRecipientsImportFilePayload>
    >['payload'] = undefined;

    if (importFile) {
      const prepareFilePayload = await prepareRecipientsImportFilePayload({
        file: importFile,
        extension: importFileExtension,
      });

      if (prepareFilePayload.error) {
        setSubmitError(prepareFilePayload.error);
        return;
      }

      fileImportPayload = prepareFilePayload.payload;
    }

    if (recipients.length === 0 && !fileImportPayload) {
      setSubmitError(IMPORT_RECIPIENTS_EMPTY_ERROR);
      return;
    }

    try {
      const createResponse = await createContactGroup.mutateAsync({
        name: values.name.trim(),
      });

      if (!createResponse.success || !createResponse.data?.group_id) {
        setSubmitError('Не удалось создать группу');
        return;
      }

      if (recipients.length > 0) {
        const importTextResponse = await importContactGroupRecipients.mutateAsync({
          group_ids: [createResponse.data.group_id],
          recipients,
          status: 1,
        });

        if (!importTextResponse.success) {
          setSubmitError('Группа создана, но пользователей добавить не удалось');
          return;
        }
      }

      const shouldImportFile = fileImportPayload
        ? shouldImportFileAfterPreview({
            mergedCount: importFileMergedCount,
            extension: importFileExtension,
          })
        : false;

      if (fileImportPayload && shouldImportFile) {
        const importFileResponse = await importContactGroupRecipients.mutateAsync({
          group_ids: [createResponse.data.group_id],
          file_data: fileImportPayload.file_data,
          file_type: fileImportPayload.file_type,
          status: 1,
        });

        if (!importFileResponse.success) {
          setSubmitError('Группа создана, но пользователей из файла добавить не удалось');
          return;
        }
      }

      handleClose();
    } catch {
      setSubmitError('Не удалось создать группу');
    }
  };

  return (
    <div>
      <SCreateContactGroupModal open={open} onCancel={handleClose}>
        <Form layout="vertical" form={form} onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="Название группы"
            rules={[{ required: true, message: 'Введите название группы' }]}
          >
            <Input placeholder="Например: VIP клиенты" maxLength={128} />
          </Form.Item>

          <Form.Item name="recipients" label="Пользователи (вручную, опционально)">
            <Input.TextArea
              rows={8}
              placeholder={`адрес1@домен.рф
адрес2@домен.рф
адрес3@домен.рф`}
            />
          </Form.Item>

          <Form.Item label="Импорт из файла (опционально)">
            <RecipientsImportFileInput
              fileInputKey={fileInputKey}
              importFile={importFile}
              importFileMergeNote={importFileMergeNote}
              onChange={handleImportFileChange}
            />
          </Form.Item>

          {submitError ? (
            <Typography.Text type="danger" style={{ marginBottom: 12, display: 'block' }}>
              {submitError}
            </Typography.Text>
          ) : null}

          <Button type="primary" htmlType="submit" loading={isSubmitting}>
            Создать группу
          </Button>
        </Form>
      </SCreateContactGroupModal>

      <Button type="primary" onClick={handleOpen}>
        Добавить группу
      </Button>
    </div>
  );
};

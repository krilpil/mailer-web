'use client';

import React, { useMemo, useState } from 'react';
import { Button, Divider, Input, Modal, Space, Table, Typography } from 'antd';

import {
  buildMergedRecipientsNote,
  ContactGroupType,
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
import {
  useDeleteContactGroup,
  useGetContactGroupContacts,
  useGetContactGroupsList,
  useImportContactGroupRecipients,
  useRemoveContactFromGroup,
} from '@/entities/contact/api';

import { buildGroupsColumns } from '../lib/buildGroupsColumns';
import { buildRecipientsColumns } from '../lib/buildRecipientsColumns';

export const SettingContacts = () => {
  const groupsList = useGetContactGroupsList();
  const deleteContactGroup = useDeleteContactGroup();
  const importContactGroupRecipients = useImportContactGroupRecipients();
  const removeContactFromGroup = useRemoveContactFromGroup();

  const [selectedGroup, setSelectedGroup] = useState<ContactGroupType | null>(null);
  const [deletingGroupId, setDeletingGroupId] = useState<number | null>(null);
  const [recipientsInput, setRecipientsInput] = useState('');
  const [addRecipientsError, setAddRecipientsError] = useState<string | null>(null);
  const [importRecipientsFile, setImportRecipientsFile] = useState<File | null>(null);
  const [importRecipientsFileExtension, setImportRecipientsFileExtension] =
    useState<ContactImportExtension | null>(null);
  const [importRecipientsFileMergedCount, setImportRecipientsFileMergedCount] = useState(0);
  const [importRecipientsFileMergeNote, setImportRecipientsFileMergeNote] = useState<string | null>(
    null
  );
  const [importRecipientsFileInputKey, setImportRecipientsFileInputKey] = useState(0);
  const [removingRecipientEmail, setRemovingRecipientEmail] = useState<string | null>(null);

  const groupContacts = useGetContactGroupContacts(selectedGroup?.group_id ?? null);

  const groupsDataSource = groupsList.data || [];
  const recipientsDataSource = groupContacts.data || [];

  const groupsColumns = useMemo(
    () =>
      buildGroupsColumns({
        onShowRecipients: (group) => setSelectedGroup(group),
        onRemove: (group) => {
          setDeletingGroupId(group.group_id);

          deleteContactGroup
            .mutateAsync({ group_id: group.group_id })
            .then(() => {
              if (selectedGroup?.group_id === group.group_id) {
                setSelectedGroup(null);
              }
            })
            .catch(() => undefined)
            .finally(() => setDeletingGroupId(null));
        },
        deletingGroupId,
      }),
    [deleteContactGroup, deletingGroupId, selectedGroup?.group_id]
  );

  const recipientsColumns = useMemo(
    () =>
      buildRecipientsColumns({
        onRemoveFromGroup: (contact) => {
          if (!selectedGroup) return;

          setRemovingRecipientEmail(contact.email);

          removeContactFromGroup
            .mutateAsync({
              group_id: selectedGroup.group_id,
              email: contact.email,
              active: contact.active,
            })
            .catch(() => undefined)
            .finally(() => setRemovingRecipientEmail(null));
        },
        removingEmail: removingRecipientEmail,
      }),
    [removeContactFromGroup, removingRecipientEmail, selectedGroup]
  );

  const handleCloseRecipients = () => {
    setSelectedGroup(null);
    setRecipientsInput('');
    setAddRecipientsError(null);
    setImportRecipientsFile(null);
    setImportRecipientsFileExtension(null);
    setImportRecipientsFileMergedCount(0);
    setImportRecipientsFileMergeNote(null);
    setImportRecipientsFileInputKey((prev) => prev + 1);
    setRemovingRecipientEmail(null);
  };

  const handleImportRecipientsFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setImportRecipientsFileMergeNote(null);
    setImportRecipientsFileMergedCount(0);

    if (!file) {
      setImportRecipientsFile(null);
      setImportRecipientsFileExtension(null);
      return;
    }

    const previewResult = await previewRecipientsImportFile({
      file,
      currentRecipients: recipientsInput,
    });

    if (previewResult.error) {
      setImportRecipientsFile(null);
      setImportRecipientsFileExtension(null);
      setAddRecipientsError(previewResult.error);
      return;
    }

    setAddRecipientsError(null);
    setImportRecipientsFile(file);
    setImportRecipientsFileExtension(previewResult.extension ?? null);

    if (typeof previewResult.mergedRecipientsText === 'string') {
      setRecipientsInput(previewResult.mergedRecipientsText);
    }

    setImportRecipientsFileMergedCount(previewResult.mergedCount);
    if (previewResult.note) {
      setImportRecipientsFileMergeNote(previewResult.note);
      return;
    }

    if (previewResult.mergedCount > 0) {
      setImportRecipientsFileMergeNote(buildMergedRecipientsNote(previewResult.mergedCount));
      return;
    }

    setImportRecipientsFileMergeNote(IMPORT_FILE_PREVIEW_FALLBACK_NOTE);
  };

  const handleAddRecipients = async () => {
    if (!selectedGroup) return;

    setAddRecipientsError(null);
    const validRecipients = parseRecipients(recipientsInput).filter(isEmail);
    let fileImportPayload: Awaited<
      ReturnType<typeof prepareRecipientsImportFilePayload>
    >['payload'] = undefined;

    if (importRecipientsFile) {
      const prepareFilePayload = await prepareRecipientsImportFilePayload({
        file: importRecipientsFile,
        extension: importRecipientsFileExtension,
      });

      if (prepareFilePayload.error) {
        setAddRecipientsError(prepareFilePayload.error);
        return;
      }

      fileImportPayload = prepareFilePayload.payload;
    }

    if (validRecipients.length === 0 && !fileImportPayload) {
      setAddRecipientsError(IMPORT_RECIPIENTS_EMPTY_ERROR);
      return;
    }

    try {
      if (validRecipients.length > 0) {
        await importContactGroupRecipients.mutateAsync({
          group_ids: [selectedGroup.group_id],
          recipients: validRecipients,
          status: 1,
        });
      }

      const shouldImportFile = fileImportPayload
        ? shouldImportFileAfterPreview({
            mergedCount: importRecipientsFileMergedCount,
            extension: importRecipientsFileExtension,
          })
        : false;

      if (fileImportPayload && shouldImportFile) {
        await importContactGroupRecipients.mutateAsync({
          group_ids: [selectedGroup.group_id],
          file_data: fileImportPayload.file_data,
          file_type: fileImportPayload.file_type,
          status: 1,
        });
      }

      setRecipientsInput('');
      setImportRecipientsFile(null);
      setImportRecipientsFileExtension(null);
      setImportRecipientsFileMergedCount(0);
      setImportRecipientsFileMergeNote(null);
      setImportRecipientsFileInputKey((prev) => prev + 1);
      await groupContacts.refetch();
    } catch {
      setAddRecipientsError('Не удалось добавить пользователей');
    }
  };

  return (
    <>
      <Table
        rowKey="group_id"
        columns={groupsColumns}
        dataSource={groupsDataSource}
        pagination={false}
        loading={groupsList.isFetching}
      />

      <Modal
        open={selectedGroup !== null}
        onCancel={handleCloseRecipients}
        footer={null}
        title={selectedGroup ? `Пользователи группы: ${selectedGroup.name}` : 'Пользователи группы'}
        width={900}
      >
        <Space direction="vertical" style={{ width: '100%', marginBottom: 16 }}>
          <Typography.Text strong>Добавить пользователей в группу</Typography.Text>
          <Input.TextArea
            rows={4}
            value={recipientsInput}
            onChange={(event) => setRecipientsInput(event.target.value)}
            placeholder={`one@example.com
two@example.com
three@example.com`}
          />
          <Typography.Text strong>Импорт из файла</Typography.Text>
          <RecipientsImportFileInput
            fileInputKey={importRecipientsFileInputKey}
            importFile={importRecipientsFile}
            importFileMergeNote={importRecipientsFileMergeNote}
            onChange={handleImportRecipientsFileChange}
          />
          <Button
            type="primary"
            onClick={handleAddRecipients}
            loading={importContactGroupRecipients.isPending}
          >
            Добавить пользователей
          </Button>
          {addRecipientsError ? (
            <Typography.Text type="danger">{addRecipientsError}</Typography.Text>
          ) : null}
        </Space>

        <Divider />

        <Typography.Paragraph style={{ marginBottom: 16 }}>
          Всего пользователей: {recipientsDataSource.length}
        </Typography.Paragraph>

        <Table
          rowKey="email"
          columns={recipientsColumns}
          dataSource={recipientsDataSource}
          pagination={{ pageSize: 10 }}
          loading={groupContacts.isFetching}
        />
      </Modal>
    </>
  );
};

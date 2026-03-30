import React from 'react';
import { Typography } from 'antd';

import { formatFileSizeMb, IMPORT_FILE_HINT } from '../../lib/recipientsImport';

type RecipientsImportFileInputProps = {
  fileInputKey: number;
  importFile: File | null;
  importFileMergeNote: string | null;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void | Promise<void>;
};

export const RecipientsImportFileInput = ({
  fileInputKey,
  importFile,
  importFileMergeNote,
  onChange,
}: RecipientsImportFileInputProps) => (
  <>
    <input key={fileInputKey} type="file" accept=".csv,.txt,.xls,.xlsx" onChange={onChange} />
    <Typography.Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
      {IMPORT_FILE_HINT}
    </Typography.Text>
    {importFileMergeNote ? (
      <Typography.Text type="secondary" style={{ display: 'block', marginTop: 4 }}>
        {importFileMergeNote}
      </Typography.Text>
    ) : null}
    {importFile ? (
      <Typography.Text style={{ display: 'block', marginTop: 4 }}>
        Выбран файл: {importFile.name} ({formatFileSizeMb(importFile.size)})
      </Typography.Text>
    ) : null}
  </>
);

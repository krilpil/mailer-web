import { ContactImportFileType } from '../../lib/recipientsImport';

export type ImportContactGroupFileType = ContactImportFileType;

export interface IImportContactGroupRecipientsPayload {
  group_ids: number[];
  recipients?: string[];
  file_data?: string;
  file_type?: ImportContactGroupFileType;
  default_active?: 0 | 1;
  status?: 0 | 1;
  overwrite?: 0 | 1;
}

export interface IImportContactGroupRecipientsResponse {
  success: boolean;
  msg: string;
  error?: string;
  data?: {
    imported_count: number;
  };
}

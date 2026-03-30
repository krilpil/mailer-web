export type IImportContactsFileType = 'csv' | 'txt' | 'excel';

export interface IImportContactsPayload {
  group_ids: number[];
  recipients?: string[];
  file_data?: string;
  file_type?: IImportContactsFileType;
  default_active?: 0 | 1;
  status?: 0 | 1;
  overwrite?: 0 | 1;
}

export interface IImportContactsResponse {
  success: boolean;
  msg: string;
  error?: string;
  data?: {
    imported_count: number;
  };
}

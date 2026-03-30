import axios from 'axios';

export type IImportContactGroupRecipientsFileType = 'csv' | 'txt' | 'excel';

export interface IImportContactGroupRecipientsPastePayload {
  group_ids: number[];
  contacts: string;
  import_type: 2;
  default_active?: 0 | 1;
  status?: 0 | 1;
  overwrite?: 0 | 1;
}

export interface IImportContactGroupRecipientsFilePayload {
  group_ids: number[];
  import_type: 1;
  file_data: string;
  file_type: IImportContactGroupRecipientsFileType;
  default_active?: 0 | 1;
  status?: 0 | 1;
  overwrite?: 0 | 1;
}

export type IImportContactGroupRecipientsPayload =
  | IImportContactGroupRecipientsPastePayload
  | IImportContactGroupRecipientsFilePayload;

export interface IImportContactGroupRecipientsProviderResponse {
  success?: boolean;
  msg?: string;
  error?: string;
  data?: {
    imported_count?: number;
  };
}

export const importContactGroupRecipients = async (
  payload: IImportContactGroupRecipientsPayload
) => {
  const importData =
    payload.import_type === 1
      ? {
          file_data: payload.file_data,
          file_type: payload.file_type,
        }
      : {
          contacts: payload.contacts,
        };

  return axios<IImportContactGroupRecipientsProviderResponse>({
    url: `${process.env.BILLION_MAIL_API}/contact/group/import`,
    method: 'POST',
    headers: {
      authorization: `${process.env.BILLION_MAIL_TOKEN}`,
      'Content-Type': 'application/json',
    },
    data: {
      group_ids: payload.group_ids,
      import_type: payload.import_type,
      default_active: payload.default_active ?? 1,
      status: payload.status ?? 1,
      overwrite: payload.overwrite ?? 0,
      ...importData,
    },
  });
};

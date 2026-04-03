import { array, mixed, number, object, ObjectSchema, string } from 'yup';

import { IImportContactsPayload } from './importContacts.types';

export const importContactsPayloadValidate: ObjectSchema<IImportContactsPayload> = object({
  group_ids: array().of(number().required().integer().positive()).required().min(1),
  recipients: array().of(string().trim().email().required()).optional(),
  file_data: string().trim().optional(),
  file_type: mixed<'csv' | 'txt' | 'excel'>().oneOf(['csv', 'txt', 'excel']).optional(),
  default_active: mixed<0 | 1>().oneOf([0, 1]).optional(),
  status: mixed<0 | 1>().oneOf([0, 1]).optional(),
  overwrite: mixed<0 | 1>().oneOf([0, 1]).optional(),
})
  .test(
    'import-source',
    'Укажите пользователей вручную или загрузите файл',
    function validateImportSource(payload) {
      const recipients = payload?.recipients ?? [];
      const hasRecipients = recipients.length > 0;
      const hasFileData = Boolean(payload?.file_data?.trim());
      const hasFileType = Boolean(payload?.file_type);

      if (!hasRecipients && !hasFileData) {
        return this.createError({
          path: 'recipients',
          message: 'Укажите пользователей вручную или загрузите файл',
        });
      }

      if (hasFileData && !hasFileType) {
        return this.createError({
          path: 'file_type',
          message: 'Укажите тип файла для загруженных данных',
        });
      }

      if (!hasFileData && hasFileType) {
        return this.createError({
          path: 'file_data',
          message: 'Добавьте данные файла для выбранного типа',
        });
      }

      return true;
    }
  )
  .required();

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
  .test('import-source', 'Provide recipients or file_data', function validateImportSource(payload) {
    const recipients = payload?.recipients ?? [];
    const hasRecipients = recipients.length > 0;
    const hasFileData = Boolean(payload?.file_data?.trim());
    const hasFileType = Boolean(payload?.file_type);

    if (!hasRecipients && !hasFileData) {
      return this.createError({
        path: 'recipients',
        message: 'Provide recipients or file_data',
      });
    }

    if (hasFileData && !hasFileType) {
      return this.createError({
        path: 'file_type',
        message: 'file_type is required with file_data',
      });
    }

    if (!hasFileData && hasFileType) {
      return this.createError({
        path: 'file_data',
        message: 'file_data is required with file_type',
      });
    }

    return true;
  })
  .required();

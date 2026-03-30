import { boolean, number, object, ObjectSchema, string } from 'yup';

import { IImportContactGroupRecipientsResponse } from './importContactGroupRecipients.types';

export const importContactGroupRecipientsResponseValidate: ObjectSchema<IImportContactGroupRecipientsResponse> =
  object({
    success: boolean().required(),
    msg: string().required(),
    error: string().optional(),
    data: object({
      imported_count: number().required().integer().min(0),
    }).optional(),
  }).required();

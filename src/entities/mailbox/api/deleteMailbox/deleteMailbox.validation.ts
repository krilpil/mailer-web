import { boolean, object, ObjectSchema, string } from 'yup';

import { IDeleteMailboxResponse } from './deleteMailbox.types';

export const deleteMailboxResponseValidate: ObjectSchema<IDeleteMailboxResponse> = object({
  success: boolean().required(),
  msg: string().required(),
}).required();

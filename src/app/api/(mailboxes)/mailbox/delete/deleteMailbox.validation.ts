import { object, ObjectSchema, string } from 'yup';

import { IDeleteMailboxPayload } from './deleteMailbox.types';

export const deleteMailboxPayloadValidate: ObjectSchema<IDeleteMailboxPayload> = object({
  username: string().required(),
}).required();

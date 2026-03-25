import { object, ObjectSchema, string } from 'yup';

import { ICreateMailboxPayload } from './createMailbox.types';

export const createMailboxPayloadValidate: ObjectSchema<ICreateMailboxPayload> = object({
  domain: string().required(),
  local_part: string().required(),
  otp: string().required(),
  otp_guid: string().required(),
}).required();

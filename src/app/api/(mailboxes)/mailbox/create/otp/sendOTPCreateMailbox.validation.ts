import { object, ObjectSchema, string } from 'yup';

import { ISendOTPCreateMailboxPayload } from './sendOTPCreateMailbox.types';

export const sendOTPCreateMailboxPayloadValidate: ObjectSchema<ISendOTPCreateMailboxPayload> =
  object({
    domain: string().required(),
    local_part: string().required(),
  }).required();

import { number, object, ObjectSchema, string } from 'yup';

import { ISendOTPCreateMailboxResponse } from './sendOTPCreateMailbox.types';

export const sendOTPCreateMailboxResponseValidate: ObjectSchema<ISendOTPCreateMailboxResponse> =
  object({
    otp_guid: string().required(),
    expires_at: number().required(),
  }).required();

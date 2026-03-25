import { number, object, ObjectSchema, string } from 'yup';

import { ISendOTPCreateDomainResponse } from './sendOTPCreateDomain.types';

export const sendOTPCreateDomainResponseValidate: ObjectSchema<ISendOTPCreateDomainResponse> =
  object({
    otp_guid: string().required(),
    expires_at: number().required(),
  });

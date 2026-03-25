import { string, object, ObjectSchema } from 'yup';

import { IOTPCreateDomainPayload } from './OTPCreateDomain.types';

export const OTPCreateDomainPayloadValidate: ObjectSchema<IOTPCreateDomainPayload> = object({
  otp: string().required(),
  otp_guid: string().required(),
  domain: string().required(),
  local_part: string().required(),
}).required();

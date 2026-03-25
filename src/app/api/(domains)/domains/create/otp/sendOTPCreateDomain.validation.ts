import { string, object, ObjectSchema } from 'yup';

import { ISendOTPCreateDomainPayload } from './sendOTPCreateDomain.types';

export const sendOTPCreateDomainPayloadValidate: ObjectSchema<ISendOTPCreateDomainPayload> =
  object({
    email: string().required(),
  }).required();

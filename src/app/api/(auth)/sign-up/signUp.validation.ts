import { object, ObjectSchema, string } from 'yup';

import { IVerifyOTPSignUpPayload } from './signUp.types';

export const verifyOTPSignUpPayloadValidate: ObjectSchema<IVerifyOTPSignUpPayload> = object({
  otp_guid: string().required(),
  email: string().required(),
  otp_code: string().required(),
  password: string().min(6).required(),
}).required();

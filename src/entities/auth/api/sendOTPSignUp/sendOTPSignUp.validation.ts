import { boolean, number, object, ObjectSchema, string } from 'yup';

import { ISendOTPSignUpResponse } from './sendOTPSignUp.types';

export const sendOTPSignUpResponseValidate: ObjectSchema<ISendOTPSignUpResponse> = object({
  success: boolean().required(),
  msg: string().required(),
  error: string().notRequired(),
  data: object({
    otp_guid: string().required(),
    expires_at: number().required(),
  })
    .notRequired()
    .nullable(),
}).required();

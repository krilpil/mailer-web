import { boolean, object, ObjectSchema, string } from 'yup';

import { ISubmitOTPSignUpResponse } from './submitOTPSignUp.types';

export const submitOTPSignUpResponseValidate: ObjectSchema<ISubmitOTPSignUpResponse> = object({
  success: boolean().required(),
  msg: string().required(),
}).required();

import { object, ObjectSchema, string } from 'yup';

import { ISendOTPSignUpPayload } from './sendOTPSignUp.types';

export const sendOTPSignUpPayloadValidate: ObjectSchema<ISendOTPSignUpPayload> = object({
  email: string().required(),
}).required();

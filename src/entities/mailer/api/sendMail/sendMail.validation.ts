import { object, string, ObjectSchema, boolean } from 'yup';

import { ISendMailResponse } from './sendMail.types';

export const sendMailResponseValidate: ObjectSchema<ISendMailResponse> = object({
  msg: string().required(),
  success: boolean().required(),
}).required();

import { string, object, ObjectSchema } from 'yup';

import { ISendMailPayload } from './sendMail.types';

export const sendMailPayloadValidate: ObjectSchema<ISendMailPayload> = object({
  recipient: string().required(),
  attribs: object({
    html: string().required(),
  }).required(),
}).required();

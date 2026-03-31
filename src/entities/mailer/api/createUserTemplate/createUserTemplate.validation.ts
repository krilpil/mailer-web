import { boolean, number, object, ObjectSchema, string } from 'yup';

import { ICreateUserTemplateResponse } from './createUserTemplate.types';

export const createUserTemplateResponseValidate: ObjectSchema<ICreateUserTemplateResponse> = object(
  {
    success: boolean().required(),
    msg: string().required(),
    error: string().optional(),
    code: number().integer().optional(),
    data: object({
      template_id: number().required().integer().positive(),
      template_name: string().required(),
    }).optional(),
  }
).required();

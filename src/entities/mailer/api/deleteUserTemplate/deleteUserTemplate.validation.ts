import { boolean, number, object, ObjectSchema, string } from 'yup';

import { IDeleteUserTemplateResponse } from './deleteUserTemplate.types';

export const deleteUserTemplateResponseValidate: ObjectSchema<IDeleteUserTemplateResponse> = object(
  {
    success: boolean().required(),
    msg: string().required(),
    error: string().optional(),
    code: number().optional(),
  }
).required();

import { boolean, number, object, ObjectSchema, string } from 'yup';

import { ICreateContactGroupResponse } from './createContactGroup.types';

export const createContactGroupResponseValidate: ObjectSchema<ICreateContactGroupResponse> = object(
  {
    success: boolean().required(),
    msg: string().required(),
    error: string().optional(),
    data: object({
      group_id: number().required().integer().positive(),
      name: string().required(),
    }).optional(),
  }
).required();

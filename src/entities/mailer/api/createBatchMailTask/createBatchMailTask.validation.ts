import { boolean, number, object, ObjectSchema, string } from 'yup';

import { ICreateBatchMailTaskResponse } from './createBatchMailTask.types';

export const createBatchMailTaskResponseValidate: ObjectSchema<ICreateBatchMailTaskResponse> =
  object({
    success: boolean().required(),
    msg: string().required(),
    code: number().integer().optional(),
    error: string().optional(),
    data: object({
      id: number().required().integer().positive(),
    }).optional(),
  }).required();

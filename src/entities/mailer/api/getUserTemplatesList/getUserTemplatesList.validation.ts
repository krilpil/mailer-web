import { boolean, number, object, ObjectSchema, string, array } from 'yup';

import { IGetUserTemplatesListResponse } from './getUserTemplatesList.types';

export const getUserTemplatesListResponseValidate: ObjectSchema<IGetUserTemplatesListResponse> =
  object({
    success: boolean().required(),
    msg: string().required(),
    error: string().optional(),
    data: object({
      total: number().required().integer().min(0),
      list: array()
        .of(
          object({
            template_id: number().required().integer().positive(),
            template_name: string().required(),
            template: string().defined(),
            create_time: number().required().integer().min(0),
            update_time: number().required().integer().min(0),
          }).required()
        )
        .required(),
    }).required(),
  }).required();

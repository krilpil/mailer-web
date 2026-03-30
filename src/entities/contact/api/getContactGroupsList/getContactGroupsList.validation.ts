import { array, boolean, number, object, ObjectSchema, string } from 'yup';

import { IGetContactGroupsListResponse } from './getContactGroupsList.types';

export const getContactGroupsListResponseValidate: ObjectSchema<IGetContactGroupsListResponse> =
  object({
    success: boolean().required(),
    msg: string().required(),
    data: object({
      total: number().required(),
      list: array()
        .of(
          object({
            group_id: number().required().integer().positive(),
            name: string().required(),
            recipients_count: number().required().integer().min(0),
          }).required()
        )
        .required(),
    }).required(),
  }).required();

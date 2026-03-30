import { array, boolean, mixed, number, object, ObjectSchema, string } from 'yup';

import { IGetContactGroupContactsResponse } from './getContactGroupContacts.types';

export const getContactGroupContactsResponseValidate: ObjectSchema<IGetContactGroupContactsResponse> =
  object({
    success: boolean().required(),
    msg: string().required(),
    error: string().optional(),
    data: object({
      total: number().required(),
      list: array()
        .of(
          object({
            id: number().required(),
            email: string().required(),
            group_id: number().required().integer().positive(),
            active: mixed<0 | 1>().oneOf([0, 1]).required(),
            status: mixed<0 | 1>().oneOf([0, 1]).required(),
            create_time: number().required(),
          }).required()
        )
        .required(),
    }).required(),
  }).required();

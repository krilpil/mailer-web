import { array, boolean, number, object, string, ObjectSchema } from 'yup';

import { IGetMailboxesListResponse } from './getMailboxesList.types';

export const getMailboxesListResponseValidate: ObjectSchema<IGetMailboxesListResponse> = object({
  success: boolean().required(),
  msg: string().required(),
  data: object({
    total: number().required(),
    list: array()
      .of(
        object({
          username: string().required(),
          create_time: number().required(),
        }).required()
      )
      .required(),
  }).required(),
}).required();

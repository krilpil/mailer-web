import { array, boolean, mixed, number, object, string, ObjectSchema } from 'yup';

import { IGetDomainsListResponse } from './getDomainsList.types';

export const getDomainsListResponseValidate: ObjectSchema<IGetDomainsListResponse> = object({
  success: boolean().required(),
  msg: string().required(),
  data: object({
    total: number().required(),
    list: array()
      .of(
        object({
          domain: string().required(),
          active: mixed<0 | 1>().oneOf([0, 1]).required(),
          create_time: number().required(),
          mailboxes: number().required(),
        }).required()
      )
      .required(),
  }).required(),
}).required();

import { number, object, ObjectSchema, string } from 'yup';

import { IGetDomainsAnalyticsQuery } from './domains.types';

export const getDomainsAnalyticsQueryValidate: ObjectSchema<IGetDomainsAnalyticsQuery> = object({
  account_id: string().trim().uuid().optional(),
  start_time: number().integer().min(0).optional(),
  end_time: number().integer().min(0).optional(),
  domains: string().trim().optional(),
}).required();

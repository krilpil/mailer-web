import { number, object, ObjectSchema, string } from 'yup';

import { IGetMailboxesAnalyticsQuery } from './mailboxes.types';

export const getMailboxesAnalyticsQueryValidate: ObjectSchema<IGetMailboxesAnalyticsQuery> = object(
  {
    account_id: string().trim().uuid().optional(),
    start_time: number().integer().min(0).optional(),
    end_time: number().integer().min(0).optional(),
    mailboxes: string().trim().optional(),
  }
).required();

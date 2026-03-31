import { number, object, ObjectSchema, string } from 'yup';

import { IGetBatchMailTaskAnalyticsQuery } from './analytics.types';

export const getBatchMailTaskAnalyticsQueryValidate: ObjectSchema<IGetBatchMailTaskAnalyticsQuery> =
  object({
    task_id: number().required().integer().positive(),
    start_time: number().optional().integer().min(0),
    end_time: number().optional().integer().min(0),
    logs_status: number().optional().integer().oneOf([0, 1]),
    logs_domain: string().trim().optional(),
    logs_page: number().optional().integer().positive(),
    logs_page_size: number().optional().integer().min(1).max(100),
  }).required();

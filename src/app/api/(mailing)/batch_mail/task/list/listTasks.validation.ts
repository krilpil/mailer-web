import { number, object, ObjectSchema, string } from 'yup';

import { IListBatchMailTasksQuery } from './listTasks.types';

export const listBatchMailTasksQueryValidate: ObjectSchema<IListBatchMailTasksQuery> = object({
  page: number().required().integer().min(1),
  page_size: number().required().integer().min(1),
  keyword: string().trim().optional(),
  status: number().integer().optional(),
}).required();

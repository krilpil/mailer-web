import { array, mixed, number, object, ObjectSchema, string } from 'yup';

import { BinaryFlag, ICreateBatchMailTaskPayload, TagLogic } from './createTask.types';

export const createBatchMailTaskPayloadValidate: ObjectSchema<ICreateBatchMailTaskPayload> = object(
  {
    addresser: string().trim().required(),
    subject: string().trim().required(),
    template_id: number().required().integer().positive(),
    group_id: number().required().integer().positive(),
    start_time: number().required().integer().min(0),
    full_name: string().trim().optional(),
    is_record: mixed<BinaryFlag>().oneOf([0, 1]).optional(),
    unsubscribe: mixed<BinaryFlag>().oneOf([0, 1]).optional(),
    threads: number().integer().min(0).optional(),
    track_open: mixed<BinaryFlag>().oneOf([0, 1]).optional(),
    track_click: mixed<BinaryFlag>().oneOf([0, 1]).optional(),
    warmup: mixed<BinaryFlag>().oneOf([0, 1]).optional(),
    remark: string().trim().optional(),
    tag_ids: array().of(number().integer().positive().required()).optional(),
    tag_logic: mixed<TagLogic>().oneOf(['AND', 'OR', 'NOT']).optional(),
  }
).required();

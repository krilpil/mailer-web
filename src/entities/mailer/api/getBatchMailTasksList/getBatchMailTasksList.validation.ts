import { array, boolean, number, object, ObjectSchema, string } from 'yup';

import { IGetBatchMailTasksListResponse } from './getBatchMailTasksList.types';

export const getBatchMailTasksListResponseValidate: ObjectSchema<IGetBatchMailTasksListResponse> =
  object({
    success: boolean().required(),
    msg: string().required(),
    code: number().integer().optional(),
    error: string().optional(),
    data: object({
      total: number().required().integer().min(0),
      list: array()
        .of(
          object({
            id: number().required().integer().positive(),
            task_name: string().required(),
            addresser: string().required(),
            subject: string().required(),
            full_name: string().required(),
            recipient_count: number().required(),
            task_process: number().required(),
            pause: number().required(),
            template_id: number().required(),
            is_record: number().required(),
            unsubscribe: number().required(),
            threads: number().required(),
            track_open: number().required(),
            track_click: number().required(),
            start_time: number().required(),
            create_time: number().required(),
            update_time: number().required(),
            remark: string().required(),
            active: number().required(),
            add_type: number().required(),
            estimated_time_with_warmup: number().required(),
            group_id: number().required(),
            group_name: string().required(),
            use_tag_filter: number().required(),
            tag_logic: string().required(),
            sent_count: number().required(),
            unsent_count: number().required(),
            progress: number().required(),
            template_name: string().required(),
            success_count: number().required(),
            error_count: number().required(),
            deferred: number().required(),
            tags: array()
              .of(
                object({
                  id: number().required().integer().positive(),
                  name: string().required(),
                  create_time: number().required(),
                }).required()
              )
              .required(),
            groups: object({
              id: number().required().integer().positive(),
              name: string().required(),
              description: string().required(),
              count: number().required().integer().min(0),
            })
              .nullable()
              .required(),
          }).required()
        )
        .required(),
    }).required(),
  }).required();

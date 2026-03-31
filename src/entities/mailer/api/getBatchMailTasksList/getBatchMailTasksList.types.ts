export interface BatchMailTaskTagType {
  id: number;
  name: string;
  create_time: number;
}

export interface BatchMailTaskGroupType {
  id: number;
  name: string;
  description: string;
  count: number;
}

export interface BatchMailTaskType {
  id: number;
  task_name: string;
  addresser: string;
  subject: string;
  full_name: string;
  recipient_count: number;
  task_process: number;
  pause: number;
  template_id: number;
  is_record: number;
  unsubscribe: number;
  threads: number;
  track_open: number;
  track_click: number;
  start_time: number;
  create_time: number;
  update_time: number;
  remark: string;
  active: number;
  add_type: number;
  estimated_time_with_warmup: number;
  group_id: number;
  group_name: string;
  use_tag_filter: number;
  tag_logic: string;
  sent_count: number;
  unsent_count: number;
  progress: number;
  template_name: string;
  success_count: number;
  error_count: number;
  deferred: number;
  tags: BatchMailTaskTagType[];
  groups: BatchMailTaskGroupType | null;
}

export interface IGetBatchMailTasksListPayload {
  page: number;
  page_size: number;
  keyword?: string;
  status?: number;
}

export interface IGetBatchMailTasksListResponse {
  success: boolean;
  msg: string;
  code?: number;
  error?: string;
  data: {
    total: number;
    list: BatchMailTaskType[];
  };
}

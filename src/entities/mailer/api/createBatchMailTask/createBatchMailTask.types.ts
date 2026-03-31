export type BinaryFlag = 0 | 1;
export type TagLogic = 'AND' | 'OR' | 'NOT';

export interface ICreateBatchMailTaskPayload {
  addresser: string;
  subject: string;
  template_id: number;
  group_id: number;
  start_time: number;
  full_name?: string;
  is_record?: BinaryFlag;
  unsubscribe?: BinaryFlag;
  threads?: number;
  track_open?: BinaryFlag;
  track_click?: BinaryFlag;
  warmup?: BinaryFlag;
  remark?: string;
  tag_ids?: number[];
  tag_logic?: TagLogic;
}

export interface ICreateBatchMailTaskResponse {
  success: boolean;
  msg: string;
  code?: number;
  error?: string;
  data?: {
    id: number;
  };
}

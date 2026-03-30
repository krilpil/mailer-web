export interface IListGroupContactsPayload {
  group_id: number;
}

export interface IListGroupContactsResponse {
  success: boolean;
  msg: string;
  error?: string;
  data: {
    total: number;
    list: Array<{
      id: number;
      email: string;
      group_id: number;
      active: 0 | 1;
      status: 0 | 1;
      create_time: number;
    }>;
  };
}

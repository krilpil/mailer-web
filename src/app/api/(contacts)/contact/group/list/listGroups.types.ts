export interface IListGroupsResponse {
  success: boolean;
  msg: string;
  data: {
    total: number;
    list: Array<{
      group_id: number;
      name: string;
      recipients_count: number;
    }>;
  };
}

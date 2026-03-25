export interface IListMailboxesResponse {
  success: boolean;
  msg: string;
  data: {
    total: number;
    list: Array<{
      username: string;
      create_time: number;
    }>;
  };
}

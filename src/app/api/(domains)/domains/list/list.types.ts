export interface IListPayload {
  page: number;
}

export interface IListResponse {
  success: boolean;
  msg: string;
  data: {
    total: number;
    list: Array<{
      domain: string;
      active: 0 | 1;
      create_time: number;
      mailboxes: number;
      dns_records: {
        spf: {
          type: string;
          host: string;
          value: string;
          valid: boolean;
        };
        dkim: {
          type: string;
          host: string;
          value: string;
          valid: boolean;
        };
        dkim_short: {
          type: string;
          host: string;
          value: string;
          valid: boolean;
        };
        dmarc: {
          type: string;
          host: string;
          value: string;
          valid: boolean;
        };
        mx: {
          type: string;
          host: string;
          value: string;
          valid: boolean;
        };
        a: {
          type: string;
          host: string;
          value: string;
          valid: boolean;
        };
        ptr: {
          type: string;
          host: string;
          value: string;
          valid: boolean;
        };
      };
    }>;
  };
}

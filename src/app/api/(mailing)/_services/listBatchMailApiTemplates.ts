import axios from 'axios';

export interface IProviderBatchMailApiTemplate {
  id?: number;
  api_name?: string;
  template_id?: number;
}

export interface IListBatchMailApiTemplatesResponse {
  success?: boolean;
  code?: number;
  msg?: string;
  error?: string;
  data?: {
    total?: number;
    list?: IProviderBatchMailApiTemplate[];
  };
}

export interface IListBatchMailApiTemplatesPayload {
  page: number;
  page_size: number;
  keyword?: string;
}

export const listBatchMailApiTemplates = async (payload: IListBatchMailApiTemplatesPayload) => {
  return axios<IListBatchMailApiTemplatesResponse>({
    url: `${process.env.BILLION_MAIL_API}/batch_mail/api/list`,
    method: 'GET',
    headers: {
      authorization: `${process.env.BILLION_MAIL_TOKEN}`,
      'Content-Type': 'application/json',
    },
    params: {
      page: payload.page,
      page_size: payload.page_size,
      keyword: payload.keyword,
    },
  });
};

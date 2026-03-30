import axios from 'axios';

export interface IProviderGroupInfo {
  id?: number;
  name?: string;
}

export interface IProviderContact {
  id?: number;
  email?: string;
  group_id?: number;
  active?: number;
  status?: number;
  create_time?: number;
  groups?: IProviderGroupInfo[];
}

export interface IListGroupContactsProviderResponse {
  success?: boolean;
  msg?: string;
  error?: string;
  data?: {
    total?: number;
    list?: IProviderContact[];
  };
}

export interface IListGroupContactsProviderPayload {
  page: number;
  page_size: number;
  group_id: number;
  keyword?: string;
}

export const listGroupContacts = async (payload: IListGroupContactsProviderPayload) => {
  return axios<IListGroupContactsProviderResponse>({
    url: `${process.env.BILLION_MAIL_API}/contact/list_ndp`,
    method: 'GET',
    headers: {
      authorization: `${process.env.BILLION_MAIL_TOKEN}`,
      'Content-Type': 'application/json',
    },
    params: {
      page: payload.page,
      page_size: payload.page_size,
      group_id: payload.group_id,
      active: -1,
      keyword: payload.keyword,
    },
  });
};

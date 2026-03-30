import axios from 'axios';

export interface IProviderContactGroup {
  id?: number;
  name?: string;
  create_time?: number;
  total_count?: number;
}

export interface IListContactGroupsAllResponse {
  success?: boolean;
  msg?: string;
  error?: string;
  data?: {
    list?: IProviderContactGroup[];
  };
}

export interface IGetContactGroupInfoResponse {
  success?: boolean;
  msg?: string;
  error?: string;
  data?: {
    id?: number;
    name?: string;
    create_time?: number;
    total_count?: number;
  };
}

export interface IListContactGroupsResponse {
  success?: boolean;
  msg?: string;
  error?: string;
  data?: {
    total?: number;
    list?: IProviderContactGroup[];
  };
}

export interface IListContactGroupsPayload {
  page: number;
  page_size: number;
  keyword?: string;
}

export const listContactGroupsAll = async (keyword?: string) => {
  return axios<IListContactGroupsAllResponse>({
    url: `${process.env.BILLION_MAIL_API}/contact/group/all`,
    method: 'GET',
    headers: {
      authorization: `${process.env.BILLION_MAIL_TOKEN}`,
      'Content-Type': 'application/json',
    },
    params: keyword ? { keyword } : undefined,
  });
};

export const getContactGroupInfo = async (groupId: number) => {
  return axios<IGetContactGroupInfoResponse>({
    url: `${process.env.BILLION_MAIL_API}/contact/group/info`,
    method: 'GET',
    headers: {
      authorization: `${process.env.BILLION_MAIL_TOKEN}`,
      'Content-Type': 'application/json',
    },
    params: {
      group_id: groupId,
    },
  });
};

export const listContactGroups = async (payload: IListContactGroupsPayload) => {
  return axios<IListContactGroupsResponse>({
    url: `${process.env.BILLION_MAIL_API}/contact/group/list`,
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

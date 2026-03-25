import axios from 'axios';

export interface IMailboxInfo {
  username?: string;
  domain?: string;
  local_part?: string;
  create_time?: number;
}

export interface IListMailboxesResponse {
  success?: boolean;
  msg?: string;
  error?: string;
  data?: IMailboxInfo[];
}

export const fetchDomainMailboxes = async (domain: string) => {
  return axios<IListMailboxesResponse>({
    url: `${process.env.BILLION_MAIL_API}/mailbox/all`,
    method: 'GET',
    headers: {
      authorization: `${process.env.BILLION_MAIL_TOKEN}`,
      'Content-Type': 'application/json',
    },
    params: {
      domain,
    },
  });
};

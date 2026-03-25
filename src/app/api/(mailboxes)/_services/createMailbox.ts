import axios from 'axios';

export interface ICreateMailboxPayload {
  domain: string;
  local_part: string;
  password: string;
  isAdmin: number;
  active: number;
}

export interface ICreateMailboxResponse {
  success?: boolean;
  msg?: string;
  error?: string;
}

export const createMailbox = async (payload: ICreateMailboxPayload) => {
  return axios<ICreateMailboxResponse>({
    url: `${process.env.BILLION_MAIL_API}/mailbox/create`,
    method: 'POST',
    headers: {
      authorization: `${process.env.BILLION_MAIL_TOKEN}`,
      'Content-Type': 'application/json;charset=UTF-8',
    },
    data: {
      isAdmin: payload.isAdmin,
      domain: payload.domain,
      local_part: payload.local_part,
      password: payload.password,
      active: payload.active,
    },
  });
};

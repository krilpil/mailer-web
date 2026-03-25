import axios from 'axios';

export interface ICreateDomainPayload {
  domain: string;
  email: string;
  quota: number;
}

export interface ICreateDomainResponse {
  success?: boolean;
  msg?: string;
  error?: string;
}

export const createDomain = async (payload: ICreateDomainPayload) => {
  return axios<ICreateDomainResponse>({
    url: `${process.env.BILLION_MAIL_API}/domains/create`,
    method: 'POST',
    headers: {
      authorization: `${process.env.BILLION_MAIL_TOKEN}`,
      'Content-Type': 'application/json;charset=UTF-8',
    },
    data: {
      quota: payload.quota,
      domain: payload.domain,
      email: payload.email,
      urls: [],
    },
  });
};

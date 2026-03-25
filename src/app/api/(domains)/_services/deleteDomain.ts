import axios from 'axios';

export interface IDeleteDomainPayload {
  domain: string;
}

export interface IDeleteDomainResponse {
  success?: boolean;
  msg?: string;
  error?: string;
}

export const deleteDomain = async (payload: IDeleteDomainPayload) => {
  return axios<IDeleteDomainResponse>({
    url: `${process.env.BILLION_MAIL_API}/domains/delete`,
    method: 'POST',
    headers: {
      authorization: `${process.env.BILLION_MAIL_TOKEN}`,
      'Content-Type': 'application/json;charset=UTF-8',
    },
    data: {
      domain: payload.domain,
    },
  });
};

import axios from 'axios';

export interface IDeleteContactsNdpResponse {
  success?: boolean;
  msg?: string;
  error?: string;
}

export interface IDeleteContactsByEmailResponse {
  success?: boolean;
  msg?: string;
  error?: string;
  data?: {
    deleted_count?: number;
  };
}

export const deleteContactsNdp = async (ids: string[]) => {
  return axios<IDeleteContactsNdpResponse>({
    url: `${process.env.BILLION_MAIL_API}/contact/delete_ndp`,
    method: 'POST',
    headers: {
      authorization: `${process.env.BILLION_MAIL_TOKEN}`,
      'Content-Type': 'application/json',
    },
    data: {
      ids,
    },
  });
};

export const deleteContactsByEmail = async (emails: string[], status: 0 | 1) => {
  return axios<IDeleteContactsByEmailResponse>({
    url: `${process.env.BILLION_MAIL_API}/contact/delete`,
    method: 'POST',
    headers: {
      authorization: `${process.env.BILLION_MAIL_TOKEN}`,
      'Content-Type': 'application/json',
    },
    data: {
      emails,
      status,
    },
  });
};

import axios from 'axios';

export interface IDeleteMailboxResponse {
  success?: boolean;
  msg?: string;
  error?: string;
}

export const deleteMailbox = async (emails: string[]) => {
  return axios<IDeleteMailboxResponse>({
    url: `${process.env.BILLION_MAIL_API}/mailbox/delete`,
    method: 'POST',
    headers: {
      authorization: `${process.env.BILLION_MAIL_TOKEN}`,
      'Content-Type': 'application/json',
    },
    data: {
      emails,
    },
  });
};

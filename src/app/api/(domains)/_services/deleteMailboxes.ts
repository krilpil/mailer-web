import axios from 'axios';

export interface IDeleteMailboxesResponse {
  success?: boolean;
  msg?: string;
  error?: string;
}

export const deleteMailboxes = async (emails: string[]) => {
  return axios<IDeleteMailboxesResponse>({
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

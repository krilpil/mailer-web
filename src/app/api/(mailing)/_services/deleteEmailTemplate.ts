import axios from 'axios';

export interface IDeleteEmailTemplatePayload {
  id: number;
}

export interface IDeleteEmailTemplateProviderResponse {
  success?: boolean;
  code?: number;
  msg?: string;
  error?: string;
}

export const deleteEmailTemplate = async (payload: IDeleteEmailTemplatePayload) => {
  return axios<IDeleteEmailTemplateProviderResponse>({
    url: `${process.env.BILLION_MAIL_API}/email_template/delete`,
    method: 'POST',
    headers: {
      authorization: `${process.env.BILLION_MAIL_TOKEN}`,
      'Content-Type': 'application/json',
    },
    data: payload,
  });
};

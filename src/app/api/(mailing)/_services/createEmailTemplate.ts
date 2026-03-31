import axios from 'axios';

export interface ICreateEmailTemplatePayload {
  temp_name: string;
  add_type: 0;
  html_content: string;
}

export interface ICreateEmailTemplateProviderResponse {
  success?: boolean;
  code?: number;
  msg?: string;
  error?: string;
  data?: {
    id?: number;
    template_id?: number;
  };
}

export const createEmailTemplate = async (payload: ICreateEmailTemplatePayload) => {
  return axios<ICreateEmailTemplateProviderResponse>({
    url: `${process.env.BILLION_MAIL_API}/email_template/create`,
    method: 'POST',
    headers: {
      authorization: `${process.env.BILLION_MAIL_TOKEN}`,
      'Content-Type': 'application/json',
    },
    data: payload,
  });
};

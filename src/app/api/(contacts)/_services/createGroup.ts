import axios from 'axios';

export interface ICreateContactGroupPayload {
  group_id: number;
  name: string;
  description?: string;
  create_type: 1;
  double_optin?: 0 | 1;
}

export interface ICreateContactGroupProviderResponse {
  success?: boolean;
  msg?: string;
  error?: string;
  data?: unknown;
}

export const createContactGroup = async (payload: ICreateContactGroupPayload) => {
  return axios<ICreateContactGroupProviderResponse>({
    url: `${process.env.BILLION_MAIL_API}/contact/group/create`,
    method: 'POST',
    headers: {
      authorization: `${process.env.BILLION_MAIL_TOKEN}`,
      'Content-Type': 'application/json',
    },
    data: {
      group_id: payload.group_id,
      name: payload.name,
      description: payload.description,
      create_type: payload.create_type,
      double_optin: payload.double_optin ?? 0,
    },
  });
};

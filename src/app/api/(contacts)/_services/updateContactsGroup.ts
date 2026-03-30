import axios from 'axios';

export interface IUpdateContactsGroupResponse {
  success?: boolean;
  msg?: string;
  error?: string;
  data?: {
    updated_count?: number;
  };
}

export interface IUpdateContactsGroupPayload {
  emails: string[];
  status: 0 | 1;
  group_ids: number[];
}

export const updateContactsGroup = async (payload: IUpdateContactsGroupPayload) => {
  return axios<IUpdateContactsGroupResponse>({
    url: `${process.env.BILLION_MAIL_API}/contact/update_group`,
    method: 'POST',
    headers: {
      authorization: `${process.env.BILLION_MAIL_TOKEN}`,
      'Content-Type': 'application/json',
    },
    data: {
      emails: payload.emails,
      status: payload.status,
      group_ids: payload.group_ids,
    },
  });
};

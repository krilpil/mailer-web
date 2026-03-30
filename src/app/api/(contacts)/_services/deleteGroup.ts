import axios from 'axios';

export interface IDeleteContactGroupProviderResponse {
  success?: boolean;
  msg?: string;
  error?: string;
  data?: {
    success_count?: number;
    failed_count?: number;
  };
}

export const deleteContactGroups = async (groupIds: number[]) => {
  return axios<IDeleteContactGroupProviderResponse>({
    url: `${process.env.BILLION_MAIL_API}/contact/group/delete`,
    method: 'POST',
    headers: {
      authorization: `${process.env.BILLION_MAIL_TOKEN}`,
      'Content-Type': 'application/json',
    },
    data: {
      group_ids: groupIds,
    },
  });
};

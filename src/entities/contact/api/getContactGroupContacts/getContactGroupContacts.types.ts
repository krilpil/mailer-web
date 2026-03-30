import { ContactRecipientType } from '../../model/contactRecipient.types';

export interface IGetContactGroupContactsPayload {
  group_id: number;
}

export interface IGetContactGroupContactsResponse {
  success: boolean;
  msg: string;
  error?: string;
  data: {
    total: number;
    list: Array<ContactRecipientType>;
  };
}

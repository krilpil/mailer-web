import { MailboxType } from '../../model/mailbox.types';

export interface IGetMailboxesListResponse {
  success: boolean;
  msg: string;
  data: {
    total: number;
    list: Array<MailboxType>;
  };
}

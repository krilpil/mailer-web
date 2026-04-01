import { IMailboxesAnalyticsData } from '@/app/api/(analytics)/_services/buildAccountAnalyticsSource';

export interface IGetMailboxesAnalyticsQuery {
  account_id?: string;
  start_time?: number;
  end_time?: number;
  mailboxes?: string;
}

export interface IGetMailboxesAnalyticsResponse {
  success: boolean;
  msg: string;
  code?: number;
  error?: string;
  data: IMailboxesAnalyticsData | null;
}

import { IDomainsAnalyticsData } from '@/app/api/(analytics)/_services/buildAccountAnalyticsSource';

export interface IGetDomainsAnalyticsQuery {
  account_id?: string;
  start_time?: number;
  end_time?: number;
  domains?: string;
}

export interface IGetDomainsAnalyticsResponse {
  success: boolean;
  msg: string;
  code?: number;
  error?: string;
  data: IDomainsAnalyticsData | null;
}

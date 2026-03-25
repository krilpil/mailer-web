import { DNSRecordsType } from '@/entities/domain';

export type IFreshDNSRecordsPayload = {
  domain: string;
};

export type IFreshDNSRecordsResponse = {
  success: boolean;
  msg: string;
  data: DNSRecordsType;
  error?: string;
};

type DNSRecordKeyType = 'spf' | 'dkim' | 'dkim_short' | 'dmarc' | 'mx' | 'a' | 'ptr';
type DNSRecordValueType = {
  type: string;
  host: string;
  value: string;
  valid: boolean;
};

export type DNSRecordsType = Record<DNSRecordKeyType, DNSRecordValueType>;

export type DomainType = {
  domain: string;
  active: 0 | 1;
  create_time: number;
  mailboxes: number;
  dns_records: DNSRecordsType;
};

export type IDNSRecord = {
  type: string;
  host: string;
  value: string;
  valid: boolean;
};

export type IDNSRecords = {
  spf: IDNSRecord;
  dkim: IDNSRecord;
  dkim_short: IDNSRecord;
  dmarc: IDNSRecord;
  mx: IDNSRecord;
  a: IDNSRecord;
  ptr: IDNSRecord;
};

export interface IFreshDNSRecordsPayload {
  domain: string;
}

export interface IFreshDNSRecordsResponse {
  success: boolean;
  msg: string;
  data: IDNSRecords;
  error?: string;
}

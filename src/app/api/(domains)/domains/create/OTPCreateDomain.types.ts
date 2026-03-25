export interface IOTPCreateDomainPayload {
  otp: string;
  otp_guid: string;
  domain: string;
  local_part: string;
}

export interface IOTPCreateDomainResponse {
  otp_guid: string;
  expires_at: number;
}

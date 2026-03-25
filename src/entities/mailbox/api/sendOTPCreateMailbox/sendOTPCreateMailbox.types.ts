export interface ISendOTPCreateMailboxPayload {
  domain: string;
  local_part: string;
}

export interface ISendOTPCreateMailboxResponse {
  otp_guid: string;
  expires_at: number;
}

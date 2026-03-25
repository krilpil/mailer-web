export interface ICreateMailboxPayload {
  domain: string;
  local_part: string;
  otp: string;
  otp_guid: string;
}

export interface ICreateMailboxResponse {
  success: boolean;
  msg: string;
  error?: string;
}

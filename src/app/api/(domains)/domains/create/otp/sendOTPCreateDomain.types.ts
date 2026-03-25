export interface ISendOTPCreateDomainPayload {
  email: string;
}

export interface ISendOTPCreateDomainResponse {
  otp_guid: string;
  expires_at: number;
}

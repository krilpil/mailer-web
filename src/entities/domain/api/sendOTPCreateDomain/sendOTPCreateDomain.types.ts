export type ISendOTPCreateDomainPayload = {
  email: string;
};

export type ISendOTPCreateDomainResponse = {
  otp_guid: string;
  expires_at: number;
};

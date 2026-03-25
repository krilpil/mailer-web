export * from './ui/CreateDomain';

export type CreateDomainOtpResponse = {
  otp_guid: string;
  expires_at: number;
};

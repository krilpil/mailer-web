export type ISubmitOTPCreateMailboxPayload = {
  otp: string;
  otp_guid: string;
  domain: string;
  local_part: string;
};

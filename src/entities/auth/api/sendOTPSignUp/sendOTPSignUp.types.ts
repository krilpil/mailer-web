export type ISendOTPSignUpPayload = {
  email: string;
};

export type ISendOTPSignUpResponse = {
  success: boolean;
  msg: string;
  error?: string;
  data?: {
    otp_guid: string;
    expires_at: number;
  };
};

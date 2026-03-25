export interface ISendOTPSignUpPayload {
  email: string;
}

export interface ISendOTPSignUpResponse {
  success: boolean;
  msg: string;
  error?: string;
  data?: {
    otp_guid: string;
    expires_at: number;
  };
}

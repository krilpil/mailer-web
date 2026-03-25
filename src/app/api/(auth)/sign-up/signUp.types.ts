export interface IVerifyOTPSignUpPayload {
  otp_guid: string;
  email: string;
  otp_code: string;
  password: string;
}

export interface IVerifyOTPSignUpResponse {
  success: boolean;
  msg: string;
}

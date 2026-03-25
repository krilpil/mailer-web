export type ISubmitOTPSignUpPayload = {
  otp_guid: string;
  email: string;
  otp_code: string;
  password: string;
};

export type ISubmitOTPSignUpResponse = {
  success: boolean;
  msg: string;
};

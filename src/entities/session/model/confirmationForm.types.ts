export type ConfirmationFormValues = {
  otpCode: string;
};

export type ConfirmationFormProps = {
  email: string;
  expiresAt: number;
  onSubmitAction: (values: ConfirmationFormValues) => void;
  onRepeatOTP: () => void;
  error?: string;
};

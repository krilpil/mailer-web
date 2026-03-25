export type SignUpFormValues = {
  email: string;
  password: string;
  confirmPassword: string;
};

export type SignUpFormProps = {
  onSubmitAction: (values: SignUpFormValues) => void;
  error?: string;
};

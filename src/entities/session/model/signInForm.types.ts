export type SignInFormValues = {
  email: string;
  password: string;
};

export type SignInFormProps = {
  onSubmit: (values: SignInFormValues) => Promise<string | null>;
};

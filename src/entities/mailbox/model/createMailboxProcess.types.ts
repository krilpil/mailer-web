export interface FormCreateMailboxValue {
  domain: string;
  localPart: string;
}

export interface CreateMailboxValueProps {
  domains: string[];
  onSubmit: (form: FormCreateMailboxValue) => void;
}

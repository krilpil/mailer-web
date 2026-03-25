export interface FormCreateDomainValue {
  domain: string;
}

export interface FormCreateEmailValue {
  localPart: string;
}

export interface FormCreateCodeValue {
  otpCode: string;
}

export interface CreateDomainValueProps {
  onSubmit: (form: FormCreateDomainValue) => void;
}

export interface CreateDomainEmailProps {
  domain: string;
  onSubmit: (form: FormCreateEmailValue) => void;
}

export interface CreateDomainCodeProps {
  email: string;
  expiresAt: number;
  onRepeatOTP: () => void;
  onSubmit: (form: FormCreateCodeValue) => void;
  error?: string;
  onClearError?: () => void;
}

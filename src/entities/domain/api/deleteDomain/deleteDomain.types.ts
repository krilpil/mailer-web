export type IDeleteDomainPayload = {
  domain: string;
};

export type IDeleteDomainResponse = {
  success: boolean;
  msg: string;
  error?: string;
};

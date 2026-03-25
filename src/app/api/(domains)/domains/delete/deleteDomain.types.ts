export interface IDeleteDomainPayload {
  domain: string;
}

export interface IDeleteDomainResponse {
  success: boolean;
  msg: string;
  error?: string;
}

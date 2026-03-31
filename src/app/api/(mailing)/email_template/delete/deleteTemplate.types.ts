export interface IDeleteUserTemplatePayload {
  template_id: number;
}

export interface IDeleteUserTemplateResponse {
  success: boolean;
  msg: string;
  error?: string;
  code?: number;
}

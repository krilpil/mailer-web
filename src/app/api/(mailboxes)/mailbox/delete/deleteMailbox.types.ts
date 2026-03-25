export interface IDeleteMailboxPayload {
  username: string;
}

export interface IDeleteMailboxResponse {
  success: boolean;
  msg: string;
  error?: string;
}

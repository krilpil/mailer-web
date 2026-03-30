export interface ICreateContactGroupPayload {
  name: string;
  description?: string;
  double_optin?: 0 | 1;
}

export interface ICreateContactGroupResponse {
  success: boolean;
  msg: string;
  error?: string;
  data?: {
    group_id: number;
    name: string;
  };
}

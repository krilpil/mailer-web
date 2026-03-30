export interface IDeleteContactGroupPayload {
  group_id: number;
}

export interface IDeleteContactGroupResponse {
  success: boolean;
  msg: string;
  error?: string;
}

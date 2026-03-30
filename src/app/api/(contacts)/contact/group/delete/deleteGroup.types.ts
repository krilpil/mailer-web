export interface IDeleteGroupPayload {
  group_id: number;
}

export interface IDeleteGroupResponse {
  success: boolean;
  msg: string;
  error?: string;
}

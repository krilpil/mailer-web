export interface IRemoveRecipientFromGroupPayload {
  group_id: number;
  email: string;
  active: 0 | 1;
}

export interface IRemoveRecipientFromGroupResponse {
  success: boolean;
  msg: string;
  error?: string;
}

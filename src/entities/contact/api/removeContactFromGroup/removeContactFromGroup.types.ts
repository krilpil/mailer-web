export interface IRemoveContactFromGroupPayload {
  group_id: number;
  email: string;
  active: 0 | 1;
}

export interface IRemoveContactFromGroupResponse {
  success: boolean;
  msg: string;
  error?: string;
}

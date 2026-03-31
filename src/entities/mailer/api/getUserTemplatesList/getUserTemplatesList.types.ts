export interface UserTemplateType {
  template_id: number;
  template_name: string;
  template: string;
  create_time: number;
  update_time: number;
}

export interface IGetUserTemplatesListResponse {
  success: boolean;
  msg: string;
  error?: string;
  data: {
    total: number;
    list: UserTemplateType[];
  };
}

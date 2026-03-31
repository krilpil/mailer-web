export interface IUserTemplateItem {
  template_id: number;
  template_name: string;
  template: string;
  create_time: number;
  update_time: number;
}

export interface IListUserTemplatesResponse {
  success: boolean;
  msg: string;
  error?: string;
  data: {
    total: number;
    list: IUserTemplateItem[];
  };
}

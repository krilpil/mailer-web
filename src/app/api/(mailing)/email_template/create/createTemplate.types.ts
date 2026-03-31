import { JSONContent } from '@tiptap/core';

export interface ICreateTemplatePayload {
  template_name: string;
  content: JSONContent;
}

export interface ICreateTemplateResponse {
  success: boolean;
  msg: string;
  error?: string;
  code?: number;
  data?: {
    template_id: number;
    template_name: string;
  };
}

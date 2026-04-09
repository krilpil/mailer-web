import { JSONContent } from '@tiptap/core';

export interface ICreateUserTemplatePayload {
  template_name: string;
  content?: JSONContent;
  html_content?: string;
}

export interface ICreateUserTemplateResponse {
  success: boolean;
  msg: string;
  error?: string;
  code?: number;
  data?: {
    template_id: number;
    template_name: string;
  };
}

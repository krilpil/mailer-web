import styled from 'styled-components';
import { Button, Form, Input } from 'antd';

import { MailerFormValues } from './MailerEditor';

const { TextArea } = Input;

export const SMailerEditor = styled.div`
  width: 100%;
  max-width: 680px;
`;

export const SForm = styled(Form<MailerFormValues>)`
  display: flex;
  flex-direction: column;
  gap: 16px;

  .ant-form-item {
    margin-bottom: 0;
  }
`;

export const SFormItem = styled(Form.Item)``;

export const SRecipientInput = styled(Input)`
  width: 100%;
`;

export const SMessageArea = styled(TextArea)`
  resize: vertical;
`;

export const SActions = styled.div`
  display: flex;
  justify-content: flex-end;
`;

export const SSendButton = styled(Button)`
  min-width: 140px;
`;

'use client';

import React from 'react';
import { FormProps } from 'antd';

import { useSendMail } from '@/entities/mailer/api';

import {
  SActions,
  SForm,
  SFormItem,
  SMailerEditor,
  SMessageArea,
  SRecipientInput,
  SSendButton,
} from './MailerEditor.styles';

export type MailerFormValues = {
  recipient: string;
  message: string;
};

export const MailerEditor = () => {
  const sendMail = useSendMail();

  const handleSendMail: FormProps<MailerFormValues>['onFinish'] = ({ recipient, message }) => {
    sendMail.mutateAsync({
      recipient,
      attribs: {
        html: message,
      },
    });
  };

  return (
    <SMailerEditor>
      <SForm
        layout="vertical"
        onFinish={handleSendMail}
        initialValues={{ recipient: 'krilpil@vk.com', message: '' }}
      >
        <SFormItem
          label="Получатель"
          name="recipient"
          rules={[{ required: true, message: 'Укажите получателя' }]}
        >
          <SRecipientInput placeholder="email@domain.com" />
        </SFormItem>

        <SFormItem
          label="Сообщение"
          name="message"
          rules={[{ required: true, message: 'Введите текст письма' }]}
        >
          <SMessageArea autoSize={{ minRows: 6, maxRows: 12 }} placeholder="Введите текст письма" />
        </SFormItem>

        <SActions>
          <SSendButton htmlType="submit" loading={sendMail.isPending} type="primary">
            Отправить
          </SSendButton>
        </SActions>
      </SForm>

      {sendMail.data && <p>{sendMail.data.msg}</p>}
    </SMailerEditor>
  );
};

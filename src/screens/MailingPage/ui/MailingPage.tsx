'use client';

import React, { useState } from 'react';
import { JSONContent } from '@tiptap/react';
import { render } from '@react-email/render';
import { Button } from 'antd';

import { MailerEditor } from '@/widgets/MailerEditor';
import { useSendMail } from '@/entities/mailer/api';
import { AddRecipientMailer, AddRecipientMailerProps } from '@/features/AddRecipientMailer';
import { EmailTemplate } from '@/entities/mailer';

import { SMailingPage, SMetaContent } from './mailingPage.styles';

const defaultContent: JSONContent = { type: 'doc', content: [{ type: 'paragraph' }] };

export const MailingPage = () => {
  const sendMail = useSendMail();

  const [recipients, setRecipients] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState<JSONContent>(defaultContent);

  const disableSendButton = !recipients.length || !title;

  const handleSendMail = async () => {
    const renderedEmailTemplate = await render(<EmailTemplate title={title} content={content} />);

    sendMail.mutateAsync({
      recipient: recipients[0],
      attribs: {
        html: renderedEmailTemplate,
      },
    });
  };

  const handleUpdateRecipient: AddRecipientMailerProps['onUpdate'] = (updatedRecipients) =>
    setRecipients(updatedRecipients);

  return (
    <SMailingPage>
      <div>
        <MailerEditor
          title={title}
          content={content}
          onUpdateTitle={setTitle}
          onUpdateContent={setContent}
        />

        <p>{JSON.stringify(content)}</p>
      </div>

      <SMetaContent>
        <Button
          onClick={handleSendMail}
          loading={sendMail.isPending}
          disabled={disableSendButton}
          type={'primary'}
          block
        >
          Отправить рассылку
        </Button>
        <AddRecipientMailer recipients={recipients} onUpdate={handleUpdateRecipient} />
        <p>{sendMail.data?.msg}</p>
      </SMetaContent>

      {/*{sendMail.data && <p>{sendMail.data.msg}</p>}*/}
    </SMailingPage>
  );
};

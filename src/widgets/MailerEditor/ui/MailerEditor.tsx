'use client';

import React, { FC } from 'react';
import { JSONContent, useEditor } from '@tiptap/react';
import { TextAreaProps } from 'antd/es/input';

import { EditorBubbleMenu, EditorFloatingMenu, EditorPositionMenu } from '@/entities/mailer';

import { SEditorContent, SHeading, SMailerEditor } from './MailerEditor.styles';
import { editorExtensions } from '../lib/editorConfig';

export interface MailerEditorProps {
  title: string;
  content: JSONContent;
  onUpdateTitle: (title: string) => void;
  onUpdateContent: (content: JSONContent) => void;
}

export const MailerEditor: FC<MailerEditorProps> = ({
  title,
  content,
  onUpdateTitle,
  onUpdateContent,
}) => {
  const editor = useEditor({
    immediatelyRender: false,
    content,
    extensions: editorExtensions,
    onUpdate: ({ editor }) => {
      onUpdateContent(editor.getJSON());
    },
  });

  const handleChangeHeading: TextAreaProps['onChange'] = (event) => {
    onUpdateTitle(event.target.value);
  };

  return (
    <SMailerEditor data-editor-root>
      <SHeading value={title} onChange={handleChangeHeading} />
      <EditorFloatingMenu editor={editor} />
      <EditorPositionMenu editor={editor} />
      <EditorBubbleMenu editor={editor} />
      <SEditorContent editor={editor} />
    </SMailerEditor>
  );
};

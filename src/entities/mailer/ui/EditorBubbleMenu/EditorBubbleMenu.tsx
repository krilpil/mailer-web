'use client';

import React, { FC, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBold,
  faItalic,
  faStrikethrough,
  faUnderline,
  faLink,
} from '@fortawesome/free-solid-svg-icons';
import { ButtonProps, InputProps } from 'antd';
import { BubbleMenuProps } from '@tiptap/react/menus';
import { useEditorState } from '@tiptap/react';

import { SBubbleMenu, SFormattingButton, SInputLink } from './editorBubbleMenu.styles';
import { EditorBubbleMenuProps } from '../../model/editorBubbleMenu.types';

const iconBold = <FontAwesomeIcon icon={faBold} />;
const iconItalic = <FontAwesomeIcon icon={faItalic} />;
const iconUnderline = <FontAwesomeIcon icon={faUnderline} />;
const iconStrikethrough = <FontAwesomeIcon icon={faStrikethrough} />;
const iconLink = <FontAwesomeIcon icon={faLink} />;

const normalizeLink = (link: string) => {
  if (/^[a-z][a-z0-9+.-]*:/i.test(link)) return link;
  if (link.startsWith('//')) return `https:${link}`;

  return `https://${link}`;
};

export const EditorBubbleMenu: FC<EditorBubbleMenuProps> = ({ editor }) => {
  const [isOpenInputLink, setOpenInputLink] = useState(false);
  const [textInputLink, setTextInputLink] = useState('');

  const editorState = useEditorState({
    editor,
    selector: ({ editor }) => ({
      isBold: !!editor?.isActive('bold'),
      isItalic: !!editor?.isActive('italic'),
      isUnderline: !!editor?.isActive('underline'),
      isStrike: !!editor?.isActive('strike'),
      isLink: !!editor?.isActive('link'),
    }),
  });

  const isBold = editorState?.isBold ?? false;
  const isItalic = editorState?.isItalic ?? false;
  const isUnderline = editorState?.isUnderline ?? false;
  const isStrike = editorState?.isStrike ?? false;
  const isLink = editorState?.isLink ?? false;

  const bubbleOptions: BubbleMenuProps['options'] = {
    placement: 'bottom',
    offset: 8,
    flip: true,
    hide: false,
    onHide: () => {
      setOpenInputLink(false);
      setTextInputLink('');
    },
  };

  const typeButtonBold: ButtonProps['type'] = isBold ? 'default' : 'text';
  const typeButtonItalic: ButtonProps['type'] = isItalic ? 'default' : 'text';
  const typeButtonUnderline: ButtonProps['type'] = isUnderline ? 'default' : 'text';
  const typeButtonStrike: ButtonProps['type'] = isStrike ? 'default' : 'text';
  const typeButtonLink: ButtonProps['type'] = isLink ? 'default' : 'text';

  const handleBold = () => {
    editor?.chain().focus().toggleBold().run();
  };

  const handleItalic = () => {
    editor?.chain().focus().toggleItalic().run();
  };

  const handleUnderline = () => {
    editor?.chain().focus().toggleUnderline().run();
  };

  const handleStrike = () => {
    editor?.chain().focus().toggleStrike().run();
  };

  const handleLink = () => {
    if (!editor) return;

    if (isLink && !isOpenInputLink) {
      const currentHref = (editor.getAttributes('link').href as string | undefined) ?? '';
      setTextInputLink(currentHref);
      setOpenInputLink(true);
      return;
    }

    if (isOpenInputLink && !textInputLink.trim()) {
      editor.chain().focus().unsetLink().run();
      setOpenInputLink(false);
      return;
    }

    setOpenInputLink((prevState) => !prevState);
  };

  const handeChangeInputLink: InputProps['onChange'] = (event) => {
    setTextInputLink(event.target.value);
  };

  const handlePressEnterInputLink: InputProps['onPressEnter'] = () => {
    const link = textInputLink.trim();

    if (link) {
      const normalizedLink = normalizeLink(link);

      editor?.chain().focus().extendMarkRange('link').setLink({ href: normalizedLink }).run();
    } else {
      editor?.chain().focus().unsetLink().run();
    }

    setOpenInputLink(false);
  };

  const handleShouldShow: BubbleMenuProps['shouldShow'] = ({ editor, state, from, to }) => {
    if (!editor?.isEditable) return false;

    const text = state.doc.textBetween(from, to, '\n', '\n').trim();
    if (!text) return false;

    return editor.isActive('paragraph') || editor.isActive('listItem');
  };

  if (!editor) return null;

  return (
    <SBubbleMenu editor={editor} shouldShow={handleShouldShow} options={bubbleOptions}>
      <SFormattingButton
        type={typeButtonBold}
        onClick={handleBold}
        icon={iconBold}
        title="Жирный"
      />
      <SFormattingButton
        type={typeButtonItalic}
        onClick={handleItalic}
        icon={iconItalic}
        title="Курсив"
      />
      <SFormattingButton
        type={typeButtonUnderline}
        onClick={handleUnderline}
        icon={iconUnderline}
        title="Подчеркнутый"
      />
      <SFormattingButton
        type={typeButtonStrike}
        onClick={handleStrike}
        icon={iconStrikethrough}
        title="Зачеркнутый"
      />
      <SFormattingButton
        type={typeButtonLink}
        onClick={handleLink}
        icon={iconLink}
        title="Ссылка"
      />

      {isOpenInputLink && (
        <SInputLink
          value={textInputLink}
          onChange={handeChangeInputLink}
          onPressEnter={handlePressEnterInputLink}
        />
      )}
    </SBubbleMenu>
  );
};

import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import { Placeholder, PlaceholderOptions } from '@tiptap/extensions';
import { Extensions } from '@tiptap/core';

const handlePlaceholder: PlaceholderOptions['placeholder'] = ({ node }) => {
  const type = node.type.name;
  const level: number | undefined = node.attrs.level;

  if (type === 'heading' && level === 2) return 'Подзаголовок 2';
  if (type === 'heading' && level === 3) return 'Подзаголовок 3';
  if (type === 'paragraph') return 'Начните писать прямо сейчас...';

  return '';
};

export const editorExtensions: Extensions = [
  StarterKit.configure({
    link: false,
    blockquote: false,
  }),
  Link.configure({
    openOnClick: false,
    linkOnPaste: true,
  }),
  Underline,
  Image,
  Placeholder.configure({
    placeholder: handlePlaceholder,
    showOnlyWhenEditable: true,
  }),
];

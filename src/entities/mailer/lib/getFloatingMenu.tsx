import { JSX } from 'react';
import { MenuProps } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowDown,
  faArrowUp,
  faHeading,
  faImage,
  faListOl,
  faListUl,
  faMinus,
  faParagraph,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import { Editor } from '@tiptap/core';
import { NodeSelection } from '@tiptap/pm/state';

import { SFloatingIcon, SFloatingItem } from '../ui/EditorFloatingMenu/editorFloatingMenu.styles';

interface IGetFloatingMenu {
  editor: Editor | null;
}

const getLabel = (label: string, icon: JSX.Element, danger?: boolean) => (
  <SFloatingItem>
    <SFloatingIcon $danger={danger}>{icon}</SFloatingIcon>
    <span>{label}</span>
  </SFloatingItem>
);

export const getContentMenu = ({ editor }: IGetFloatingMenu): MenuProps['items'] => {
  return [
    {
      label: getLabel('Текст', <FontAwesomeIcon icon={faParagraph} />),
      key: 'paragraph',
      onClick: () => editor?.chain().focus().setParagraph().run(),
    },
    {
      label: getLabel('Заголовок 2', <FontAwesomeIcon icon={faHeading} />),
      key: 'heading-2',
      onClick: () => editor?.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      label: getLabel('Заголовок 3', <FontAwesomeIcon icon={faHeading} />),
      key: 'heading-3',
      onClick: () => editor?.chain().focus().toggleHeading({ level: 3 }).run(),
    },
    {
      label: getLabel('Изображение', <FontAwesomeIcon icon={faImage} />),
      key: 'image',
      onClick: () => {
        if (!editor) return;

        const url = window.prompt('Введите URL изображения');
        if (!url) return;

        editor.chain().focus().setImage({ src: url.trim() }).run();
      },
    },
    {
      label: getLabel('Маркированный список', <FontAwesomeIcon icon={faListUl} />),
      key: 'bullet-list',
      onClick: () => editor?.chain().focus().toggleBulletList().run(),
    },
    {
      label: getLabel('Нумерованный список', <FontAwesomeIcon icon={faListOl} />),
      key: 'ordered-list',
      onClick: () => editor?.chain().focus().toggleOrderedList().run(),
    },
    {
      label: getLabel('Разделитель', <FontAwesomeIcon icon={faMinus} />),
      key: 'horizontal-rule',
      onClick: () => editor?.chain().focus().setHorizontalRule().run(),
    },
  ];
};

const resolveContext = (selection: Editor['state']['selection']) => {
  const { $from } = selection;

  const isNodeSelection = selection instanceof NodeSelection;
  if (isNodeSelection) {
    const depth = $from.depth;
    const parentDepth = Math.max(depth - 1, 0);
    const parent = $from.node(parentDepth);
    const index = $from.index(parentDepth);

    if (!parent || index < 0 || index >= parent.childCount) return null;

    return {
      parent,
      index,
      node: parent.child(index),
      from: selection.from,
      to: selection.to,
    };
  }

  let depth = $from.depth;
  while (depth > 0 && $from.node(depth - 1).type.name !== 'doc') {
    depth -= 1;
  }
  if (depth === 0) return null;

  const parent = $from.node(depth - 1);
  const index = $from.index(depth - 1);
  if (!parent || index < 0 || index >= parent.childCount) return null;

  const node = parent.child(index);

  return {
    parent,
    index,
    node,
    from: $from.before(depth),
    to: $from.after(depth),
  };
};

export const getPositionMenu = ({ editor }: IGetFloatingMenu): MenuProps['items'] => {
  return [
    {
      label: getLabel('Переместить вверх', <FontAwesomeIcon icon={faArrowUp} />),
      key: 'move-up',
      onClick: () =>
        editor
          ?.chain()
          .focus()
          .command(({ state, tr }) => {
            const ctx = resolveContext(state.selection);
            if (!ctx) return false;

            const { parent, index, node, from } = ctx;
            if (index === 0) return false;

            const prevNode = parent.child(index - 1);
            const to = from + node.nodeSize;
            const prevFrom = from - prevNode.nodeSize;

            const slice = tr.doc.slice(from, to);
            tr.delete(from, to);
            tr.insert(prevFrom, slice.content);

            return true;
          })
          .run(),
    },
    {
      label: getLabel('Переместить вниз', <FontAwesomeIcon icon={faArrowDown} />),
      key: 'move-down',
      onClick: () =>
        editor
          ?.chain()
          .focus()
          .command(({ state, tr }) => {
            const ctx = resolveContext(state.selection);
            if (!ctx) return false;

            const { parent, index, from, to } = ctx;
            if (index === parent.childCount - 1) return false;

            const nextNode = parent.child(index + 1);
            const blockSize = to - from;
            const nextTo = to + nextNode.nodeSize;

            const slice = tr.doc.slice(from, to);
            tr.delete(from, to);

            const insertPos = nextTo - blockSize;
            tr.insert(insertPos, slice.content);

            return true;
          })
          .run(),
    },
    {
      label: getLabel('Удалить блок', <FontAwesomeIcon icon={faTrash} />, true),
      key: 'remove',
      onClick: () =>
        editor
          ?.chain()
          .focus()
          .command(({ state, tr }) => {
            const ctx = resolveContext(state.selection);
            if (!ctx) return false;

            const { from, to } = ctx;
            tr.delete(from, to);

            return true;
          })
          .run(),
    },
  ];
};

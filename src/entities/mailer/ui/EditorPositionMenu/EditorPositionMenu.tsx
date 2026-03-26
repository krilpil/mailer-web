'use client';

import React, { FC, MouseEventHandler, useEffect, useMemo, useRef, useState } from 'react';
import { MenuProps } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGripVertical } from '@fortawesome/free-solid-svg-icons';

import { SButton, SDropdown, SEditorPositionMenu } from './editorPositionMenu.styles';
import { EditorPositionMenuProps, FocusableBlock } from '../../model/editorPositionMenu.types';
import { getPositionMenu } from '../../lib/getFloatingMenu';
import {
  findFocusableBlockAtDocPos,
  focusBlockInEditor,
  getNodeDomAtDocPos,
  getDocPosFromMouseEvent,
  isBlockNonEmpty,
} from '../../lib/editorPositionMenu';

const iconDots = <FontAwesomeIcon icon={faGripVertical} />;

export const EditorPositionMenu: FC<EditorPositionMenuProps> = ({ editor }) => {
  const [menuTopPx, setMenuTopPx] = useState(0);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const hoveredBlockRef = useRef<FocusableBlock | null>(null);
  const dropdownItems: MenuProps['items'] = useMemo(() => getPositionMenu({ editor }), [editor]);

  useEffect(() => {
    if (!editor) return;

    const editorRootEl = document.querySelector('[data-editor-root]') as HTMLElement | null;
    if (!editorRootEl) return;

    const onMouseMove = (event: MouseEvent) => {
      if (editor.isDestroyed) return;
      if (isDropdownOpen) return;

      const docPos = getDocPosFromMouseEvent(editor, event);
      if (docPos === null) return;

      const block = findFocusableBlockAtDocPos(editor, docPos);
      if (!block) return;

      if (!isBlockNonEmpty(block)) {
        setIsMenuVisible(false);
        hoveredBlockRef.current = null;
        return;
      }

      const blockDom = getNodeDomAtDocPos(editor, block.pos);
      if (!blockDom) return;

      const blockRect = blockDom.getBoundingClientRect();
      const rootRect = editorRootEl.getBoundingClientRect();

      const nextMenuTopPx =
        blockRect.top - rootRect.top + editorRootEl.scrollTop + blockRect.height / 2;

      setMenuTopPx(nextMenuTopPx);
      setIsMenuVisible(true);
      hoveredBlockRef.current = block;
    };

    editorRootEl.addEventListener('mousemove', onMouseMove);
    return () => editorRootEl.removeEventListener('mousemove', onMouseMove);
  }, [editor, isDropdownOpen]);

  const handleMenuMouseDownCapture: MouseEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault();
    if (!editor || editor.isDestroyed) return;

    const hoveredBlock = hoveredBlockRef.current;
    if (!hoveredBlock) return;

    focusBlockInEditor(editor, hoveredBlock);
  };

  if (!isMenuVisible || !editor) return null;

  return (
    <SEditorPositionMenu style={{ top: menuTopPx }} onMouseDownCapture={handleMenuMouseDownCapture}>
      <SDropdown
        trigger={['click']}
        menu={{ items: dropdownItems }}
        onOpenChange={setIsDropdownOpen}
      >
        <SButton icon={iconDots} />
      </SDropdown>
    </SEditorPositionMenu>
  );
};

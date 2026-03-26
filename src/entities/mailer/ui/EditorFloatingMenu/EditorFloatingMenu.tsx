'use client';

import React, { FC } from 'react';
import { MenuProps } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

import { getContentMenu } from '../../lib/getFloatingMenu';
import { SButton, SDropdown, SEditorFloatingMenu } from './editorFloatingMenu.styles';
import { EditorFloatingMenuProps } from '../../model/editorFloatingMenu.types';

const iconPlus = <FontAwesomeIcon icon={faPlus} />;

export const EditorFloatingMenu: FC<EditorFloatingMenuProps> = ({ editor }) => {
  if (!editor) return null;

  const itemsContent: MenuProps['items'] = getContentMenu({ editor });

  return (
    <SEditorFloatingMenu editor={editor}>
      <SDropdown menu={{ items: itemsContent }}>
        <SButton icon={iconPlus} />
      </SDropdown>
    </SEditorFloatingMenu>
  );
};

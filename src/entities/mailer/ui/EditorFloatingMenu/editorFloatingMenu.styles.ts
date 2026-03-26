import styled, { css } from 'styled-components';
import { FloatingMenu } from '@tiptap/react/menus';
import { Button, Dropdown } from 'antd';

import { SFloatingIconProps } from '../../model/editorFloatingMenu.types';

export const SEditorFloatingMenu = styled(FloatingMenu).attrs({
  options: {
    strategy: 'absolute',
    offset: {
      mainAxis: -48,
    },
  },
})``;

export const SButton = styled(Button).attrs({
  type: 'text',
})`
  &.ant-btn {
    height: unset;
    width: unset;
    padding: 8px 10px;
    color: #7a7a7a;
  }
`;

export const SDropdown = styled(Dropdown).attrs({
  trigger: ['click'],
  classNames: {
    root: 'floating-menu-dropdown',
  },
})`
  body:has(&) .floating-menu-dropdown {
    overflow: hidden;
    border-radius: 12px 12px 24px 24px;
    padding: 8px;
    box-shadow:
      0 6px 16px 0 rgba(0, 0, 0, 0.08),
      0 3px 6px -4px rgba(0, 0, 0, 0.12),
      0 9px 28px 8px rgba(0, 0, 0, 0.05);
    background: #fff;
  }
`;

export const SFloatingItem = styled.span`
  display: flex;
  gap: 8px;
  align-items: center;
`;

export const SFloatingIcon = styled.span<SFloatingIconProps>`
  display: flex;
  width: 28px;
  height: 28px;
  justify-content: center;
  align-items: center;
  border-radius: 8px;

  ${({ $danger }) =>
    !$danger &&
    css`
      background-color: #f2f2f2;
    `}

  ${({ $danger }) =>
    $danger &&
    css`
      color: #b42318;
      background-color: #fef3f2;
    `}
`;

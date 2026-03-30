import styled from 'styled-components';
import { Button, Dropdown } from 'antd';

export const SEditorPositionMenu = styled.div`
  position: absolute;
  transform: translate(-100%, -50%);
  left: 24px;
  z-index: 999;
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

export const SButton = styled(Button).attrs({
  type: 'text',
})`
  &.ant-btn {
    height: unset;
    width: unset;
    padding: 8px 12px;
    color: #7a7a7a;
  }
`;

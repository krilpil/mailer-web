import styled from 'styled-components';
import { BubbleMenu } from '@tiptap/react/menus';
import { Button, Input } from 'antd';

export const SBubbleMenu = styled(BubbleMenu)`
  display: flex;
  gap: 2px;
  position: relative;
  z-index: 10;
  padding: 8px;
  border-radius: 12px;
  background-color: #fff;
  box-shadow: 0 2px 12px rgba(15, 7, 69, 0.1);
`;

export const SFormattingButton = styled(Button)`
  &.ant-btn {
    color: #3b3b3b;

    &:not(:disabled):not(.ant-btn-disabled):hover {
      color: #3b3b3b;
      background-color: #f1f1f1;
    }

    &.ant-btn-variant-outlined {
      border-color: transparent;
      background: #fafafa;
    }
  }
`;

export const SInputLink = styled(Input).attrs({
  placeholder: 'Вставьте ссылку',
  variant: 'borderless',
})`
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 4px;
  padding: 10px 16px;
  background-color: #fff;
  box-shadow: 0 2px 12px rgba(15, 7, 69, 0.1);
`;

import styled from 'styled-components';
import { Button, Menu } from 'antd';

export const SWrapper = styled.aside<{ $isInDrawer?: boolean }>`
  width: 100%;
  height: ${({ $isInDrawer }) => ($isInDrawer ? '100%' : '100vh')};
  position: ${({ $isInDrawer }) => ($isInDrawer ? 'static' : 'sticky')};
  top: ${({ $isInDrawer }) => ($isInDrawer ? 'auto' : '0')};
  align-self: ${({ $isInDrawer }) => ($isInDrawer ? 'stretch' : 'start')};
  border-right: 1px solid #e5e7eb;
  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
  padding: 18px 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  overflow-y: auto;

  @media (max-width: 1024px) {
    position: static;
    top: auto;
    height: 100%;
    border-right: none;
    padding: 8px 2px 2px;
  }
`;

export const SBrand = styled.div`
  padding: 4px 10px 12px;
  border-bottom: 1px solid #e6ecf5;
`;

export const SBrandTitle = styled.div`
  font-size: 16px;
  line-height: 1.1;
  letter-spacing: 0.08em;
  font-weight: 700;
  color: #0f1b2d;
`;

export const SBrandSubtitle = styled.div`
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
`;

export const SMenu = styled(Menu)`
  flex: 1;
  border-inline-end: none !important;
  background: transparent;
  padding-top: 8px;

  .ant-menu-item {
    margin-inline: 0 !important;
    margin-block: 4px !important;
    height: 40px;
    line-height: 40px;
    border-radius: 10px;
    font-weight: 500;
  }

  .ant-menu-title-content a {
    color: inherit;
    text-decoration: none;
    display: block;
    width: 100%;
  }
`;

export const SSignOutButton = styled(Button)`
  width: 100%;
  border-radius: 10px;
  justify-content: flex-start;
`;

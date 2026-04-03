import styled from 'styled-components';

export const SLayout = styled.div`
  min-height: 100vh;
  display: flex;
  background: linear-gradient(180deg, #f4f7fc 0%, #eff4fa 100%);
`;

export const SSidebar = styled.div`
  width: 282px;
  flex: 0 0 282px;
  border-right: 1px solid #e2e8f0;

  @media (max-width: 1024px) {
    display: none;
  }
`;

export const SMainArea = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
  min-width: 0;
`;

export const SContent = styled.main`
  flex: 1;
  min-width: 0;
  padding: clamp(14px, 2.4vw, 28px);

  > * {
    width: min(100%, 1280px);
    margin-inline: auto;
  }

  h2 {
    margin-bottom: 16px;
    color: #0f1b2d;
    font-size: clamp(22px, 2.3vw, 30px);
    line-height: 1.25;
  }

  .ant-space,
  .ant-table-wrapper {
    width: 100%;
  }

  .ant-table-wrapper {
    overflow-x: auto;
    border-radius: 12px;
  }

  @media (max-width: 768px) {
    padding: 12px;
  }
`;

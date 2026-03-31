import { Modal } from 'antd';
import styled from 'styled-components';

export const SViewMailingTaskAnalyticsModal = styled(Modal).attrs({
  centered: true,
  destroyOnHidden: true,
  footer: null,
  width: 1100,
})`
  & .ant-modal-body {
    display: flex;
    flex-direction: column;
    gap: 16px;
    max-height: 75vh;
    overflow-y: auto;
  }
`;

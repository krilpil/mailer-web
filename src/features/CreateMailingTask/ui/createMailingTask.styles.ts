import { Modal } from 'antd';
import styled from 'styled-components';

export const SCreateMailingTaskModal = styled(Modal).attrs({
  title: 'Новая рассылка',
  centered: true,
  destroyOnHidden: true,
  footer: null,
})`
  & .ant-modal-body {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
`;

import { Modal } from 'antd';
import styled from 'styled-components';

export const SCreateContactGroupModal = styled(Modal).attrs({
  title: 'Новая группа контактов',
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

import styled from 'styled-components';
import { Modal } from 'antd';

export const SModalCreate = styled(Modal).attrs({
  title: 'Добавить почтовый ящик',
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

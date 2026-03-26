import styled from 'styled-components';
import { Button, Input } from 'antd';

export const SAddRecipientMailer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 24px;
  border: 1px solid #ececec;
  border-radius: 12px;
  background-color: #fff;
`;

export const SSectionTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  color: #3b3b3b;
`;

export const SAddRecipientRow = styled.div`
  display: flex;
  gap: 8px;
`;

export const SRecipientInput = styled(Input)`
  width: 100%;
`;

export const SSubmitRecipientButton = styled(Button)``;

export const SErrorText = styled.p`
  margin: 0;
  color: #cf1322;
  font-size: 13px;
`;

export const SRecipientList = styled.ul`
  display: flex;
  flex-direction: column;
  max-height: 500px;
  overflow-y: scroll;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
`;

export const SRecipientItem = styled.li`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 8px;
  background-color: #f7f7f7;
  color: #3b3b3b;
`;

export const SRemoveRecipientButton = styled(Button)`
  &.ant-btn {
    color: #cf1322;
  }
`;

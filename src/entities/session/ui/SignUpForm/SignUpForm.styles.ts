import styled from 'styled-components';
import { Input } from 'antd';

export const SFormWrapper = styled.form`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

export const SField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const SLabel = styled.label`
  font-weight: 600;
  color: #0f172a;
  font-size: 14px;
`;

export const SStyledInput = styled(Input)`
  border-radius: 10px;
  height: 44px;
`;

export const SStyledPassword = styled(Input.Password)`
  border-radius: 10px;
  height: 44px;
`;

export const SFieldError = styled.div`
  color: #d92d20;
  font-size: 12px;
  margin-top: -2px;
`;

export const SLinksRow = styled.div`
  display: flex;
  gap: 8px;
  align-self: center;
  font-size: 14px;
  color: #6b7280;
`;

export const SInlineLink = styled.a`
  color: #2f6bff;
  font-weight: 600;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

export const SFormError = styled.div`
  color: #d92d20;
  font-size: 13px;
  margin-top: -4px;
`;

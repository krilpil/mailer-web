import styled from 'styled-components';
import { Input } from 'antd';

export const FormWrapper = styled.form`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

export const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const Label = styled.label`
  font-weight: 600;
  color: #0f172a;
  font-size: 14px;
`;

export const StyledInput = styled(Input)`
  border-radius: 10px;
  height: 44px;
`;

export const StyledPassword = styled(Input.Password)`
  border-radius: 10px;
  height: 44px;
`;

export const FieldError = styled.div`
  color: #d92d20;
  font-size: 12px;
  margin-top: -2px;
`;

export const LinksRow = styled.div`
  display: flex;
  gap: 8px;
  align-self: center;
  font-size: 14px;
  color: #6b7280;
`;

export const RightLinkRow = styled(LinksRow)`
  justify-content: flex-end;
  width: 100%;
`;

export const InlineLink = styled.a`
  color: #2f6bff;
  font-weight: 600;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

export const FormError = styled.div`
  color: #d92d20;
  font-size: 13px;
  margin-top: -4px;
`;

import styled from 'styled-components';
import { Input } from 'antd';

export const SFormWrapper = styled.form`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

export const SDescription = styled.p`
  margin: 0 0 4px;
  color: #6b7280;
  font-size: 14px;
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

export const SFieldError = styled.div`
  color: #d92d20;
  font-size: 12px;
  margin-top: -2px;
`;

export const SRepeatHint = styled.p`
  margin: 0;
  color: #6b7280;
  font-size: 13px;
  text-align: center;
`;

export const SInputOTP = styled(Input.OTP)`
  &.ant-otp {
    display: flex;
    flex-wrap: wrap;
    column-gap: 16px;

    & .ant-otp-input-wrapper {
      flex: 1 1 0;
    }
  }
`;

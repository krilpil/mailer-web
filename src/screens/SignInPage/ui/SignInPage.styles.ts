import styled from 'styled-components';

export const SPage = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #f5f7fb;
  padding: 64px 16px 80px;
  color: #0f172a;
`;

export const SBrand = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
`;

export const SBrandName = styled.div`
  font-size: 22px;
  font-weight: 700;
`;

export const STitle = styled.h1`
  font-size: 32px;
  line-height: 1.2;
  margin: 0 0 6px;
`;

export const SSubtitle = styled.p`
  margin: 0 0 32px;
  color: #6b7280;
  font-size: 15px;
`;

export const SCard = styled.div`
  width: 100%;
  max-width: 520px;
  background: #ffffff;
  border-radius: 14px;
  padding: 28px 32px;
  box-shadow: 0 18px 35px rgba(15, 23, 42, 0.08);
`;

export const SFormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

import styled from 'styled-components';

export const SWrapper = styled.header`
  min-height: 74px;
  position: sticky;
  top: 0;
  z-index: 20;
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 24px;
  border-bottom: 1px solid #e6edf7;
  background: rgba(255, 255, 255, 0.9);

  .mobile-menu-toggle {
    display: none;
  }

  @media (max-width: 1024px) {
    padding: 10px 14px;
    min-height: 66px;

    .mobile-menu-toggle {
      display: inline-flex;
    }
  }
`;

export const SBrand = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
`;

export const SMeta = styled.div`
  min-width: 0;
`;

export const SBrandTitle = styled.div`
  font-weight: 800;
  font-size: clamp(16px, 2vw, 18px);
  letter-spacing: 0.08em;
  color: #0f1b2d;
`;

export const SBrandSubtitle = styled.div`
  margin-top: 2px;
  color: #6b7280;
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  @media (max-width: 600px) {
    display: none;
  }
`;

export const SSection = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 1px solid #d9e4f5;
  background: #f6faff;
  color: #1d4ed8;
  border-radius: 999px;
  padding: 6px 12px;

  @media (max-width: 768px) {
    padding: 6px 10px;
  }
`;

export const SSectionIcon = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
`;

export const SSectionTitle = styled.span`
  font-weight: 600;
  font-size: 13px;
`;

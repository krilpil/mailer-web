import styled from 'styled-components';

export const SLayout = styled.div`
  min-height: 100vh;
  display: grid;
  grid-template-columns: 270px 1fr;
  background: #f5f7fb;
`;

export const SMainArea = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

export const SContent = styled.main`
  padding: 24px;
  flex: 1;
`;

import styled from 'styled-components';

export const SWrapper = styled.aside`
  width: 100%;
  min-height: 100vh;
  border-right: 1px solid #e5e7eb;
  background: #fff;
  padding: 24px 16px;
`;

export const SNav = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const SNavItem = styled.li`
  a {
    color: #0f172a;
    text-decoration: none;
    font-weight: 500;
  }

  a:hover {
    color: #2563eb;
  }
`;

export const SSignOutButton = styled.button`
  width: 100%;
  padding: 0;
  background: transparent;
  border: none;
  color: #0f172a;
  font-weight: 500;
  text-align: left;
  cursor: pointer;

  &:hover {
    color: #2563eb;
  }
`;

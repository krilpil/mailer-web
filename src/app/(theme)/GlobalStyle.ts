import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  * {
    padding: 0;
    margin: 0;
    border: none;
  }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  html {
    scrollbar-gutter: stable;
  }

  body {
    font-family: var(--font-roboto);

    &::-webkit-scrollbar {
      -webkit-appearance: none;
      position: absolute;
      left: 0;
      width: 10px;
    }

    &::-webkit-scrollbar-thumb {
      background-color: #adadad;
      border-radius: 10px;
    }

    &::-webkit-scrollbar-track {
      background: #f7f8f7;
    }
  }
`;

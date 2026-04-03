import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  :root {
    --app-bg: #eff4fa;
    --surface-bg: #ffffff;
    --text-primary: #0f172a;
    --text-secondary: #475569;
    --border-soft: #dbe5f2;
  }

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
    -webkit-text-size-adjust: 100%;
  }

  body {
    font-family: var(--font-roboto);
    background: radial-gradient(circle at 8% 0%, #eef5ff 0%, #eff4fa 45%, #ecf2f9 100%);
    color: var(--text-primary);
    line-height: 1.4;
    min-height: 100vh;

    a {
      color: inherit;
    }

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
      background: #f2f5f9;
    }
  }

  #__next {
    min-height: 100vh;
  }
`;

'use client';

import { PropsWithChildren, useState } from 'react';
import { useServerInsertedHTML } from 'next/navigation';
import { ServerStyleSheet, StyleSheetManager } from 'styled-components';

import { GlobalStyle } from '../../(theme)/GlobalStyle';

export const StyledComponentsProvider = ({ children }: PropsWithChildren) => {
  const [sheet] = useState(() => new ServerStyleSheet());

  useServerInsertedHTML(() => {
    const styles = sheet.getStyleElement();
    sheet.instance.clearTag();
    return <>{styles}</>;
  });

  if (typeof window !== 'undefined') {
    return (
      <>
        <GlobalStyle />
        {children}
      </>
    );
  }

  return (
    <StyleSheetManager sheet={sheet.instance}>
      <GlobalStyle />
      {children}
    </StyleSheetManager>
  );
};

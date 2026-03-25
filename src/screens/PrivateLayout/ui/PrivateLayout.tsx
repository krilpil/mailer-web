import React, { FC, PropsWithChildren } from 'react';

import { SideMenu } from '@/widgets/SideMenu';
import { Header } from '@/widgets/Header';

import { SLayout, SMainArea, SContent } from './privateLayout.styles';

export const PrivateLayout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <SLayout>
      <SideMenu />
      <SMainArea>
        <Header />
        <SContent>{children}</SContent>
      </SMainArea>
    </SLayout>
  );
};

'use client';

import React, { FC, PropsWithChildren, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Drawer } from 'antd';

import { SideMenu } from '@/widgets/SideMenu';
import { Header } from '@/widgets/Header';

import { SLayout, SMainArea, SContent, SSidebar } from './privateLayout.styles';

export const PrivateLayout: FC<PropsWithChildren> = ({ children }) => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <SLayout>
      <SSidebar>
        <SideMenu />
      </SSidebar>
      <SMainArea>
        <Header onOpenMobileMenu={() => setIsMobileMenuOpen(true)} />
        <SContent>{children}</SContent>
      </SMainArea>

      <Drawer
        title={null}
        placement="left"
        width={292}
        closable={false}
        onClose={() => setIsMobileMenuOpen(false)}
        open={isMobileMenuOpen}
        styles={{ body: { padding: 0 } }}
      >
        <SideMenu isInDrawer onNavigate={() => setIsMobileMenuOpen(false)} />
      </Drawer>
    </SLayout>
  );
};

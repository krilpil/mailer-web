'use client';

import Link from 'next/link';
import { signOut } from 'next-auth/react';

import { routes } from '@/shared/config';

import { SWrapper, SNav, SNavItem, SSignOutButton } from './sideMenu.styles';

const navItems = [
  { href: routes.HOME_PAGE, label: 'Главная' },
  { href: routes.MAILINGS_PAGE, label: 'Рассылки' },
  { href: routes.NEW_TEMPLATE_PAGE, label: 'Новый шаблон' },
  { href: routes.TEMPLATES_PAGE, label: 'Список шаблонов' },
  { href: routes.CONTACTS_PAGE, label: 'Контакты' },
  { href: routes.MAILBOXES_PAGE, label: 'Почтовые ящики' },
  { href: routes.SETTINGS_PAGE, label: 'Настройки' },
];

export const SideMenu = () => {
  const handleSignOut = () => signOut();

  return (
    <SWrapper>
      <SNav>
        {navItems.map((item) => (
          <SNavItem key={item.href}>
            <Link href={item.href}>{item.label}</Link>
          </SNavItem>
        ))}
        <SNavItem>
          <SSignOutButton type="button" onClick={handleSignOut}>
            Выйти
          </SSignOutButton>
        </SNavItem>
      </SNav>
    </SWrapper>
  );
};

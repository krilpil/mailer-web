'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  faAddressBook,
  faChartLine,
  faGlobe,
  faInbox,
  faList,
  faPaperPlane,
  faPenToSquare,
  faRightFromBracket,
  faHeadset,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { MenuProps } from 'antd';

import { routes } from '@/shared/config';

import {
  SWrapper,
  SMenu,
  SSignOutButton,
  SBrand,
  SBrandTitle,
  SBrandSubtitle,
} from './sideMenu.styles';

const navItems = [
  { href: routes.HOME_PAGE, label: 'Аналитика', icon: faChartLine },
  { href: routes.MAILINGS_PAGE, label: 'Рассылки', icon: faPaperPlane },
  { href: routes.NEW_TEMPLATE_PAGE, label: 'Новый шаблон', icon: faPenToSquare },
  { href: routes.TEMPLATES_PAGE, label: 'Список шаблонов', icon: faList },
  { href: routes.CONTACTS_PAGE, label: 'Контакты', icon: faAddressBook },
  { href: routes.MAILBOXES_PAGE, label: 'Почтовые ящики', icon: faInbox },
  { href: routes.SETTINGS_PAGE, label: 'Домены', icon: faGlobe },
  { href: routes.SUPPORT_PAGE, label: 'Поддержка', icon: faHeadset, target: '_blank' },
];

const menuItems: MenuProps['items'] = navItems.map((item) => ({
  key: item.href,
  icon: <FontAwesomeIcon icon={item.icon} fixedWidth />,
  label: (
    <Link href={item.href} target={item.target ? item.target : undefined}>
      {item.label}
    </Link>
  ),
}));

const resolveSelectedKey = (pathname: string): string => {
  for (const item of navItems) {
    if (item.href === routes.HOME_PAGE) {
      if (pathname === routes.HOME_PAGE) return item.href;
      continue;
    }

    if (pathname === item.href || pathname.startsWith(`${item.href}/`)) {
      return item.href;
    }
  }

  return routes.HOME_PAGE;
};

interface SideMenuProps {
  isInDrawer?: boolean;
  onNavigate?: () => void;
}

export const SideMenu = ({ isInDrawer = false, onNavigate }: SideMenuProps) => {
  const pathname = usePathname();
  const handleSignOut = async () => {
    onNavigate?.();
    await signOut();
  };

  return (
    <SWrapper $isInDrawer={isInDrawer}>
      <SBrand>
        <SBrandTitle>MAILFINCH</SBrandTitle>
        <SBrandSubtitle>Control Panel</SBrandSubtitle>
      </SBrand>

      <SMenu
        mode="inline"
        selectedKeys={[resolveSelectedKey(pathname)]}
        items={menuItems}
        onClick={() => onNavigate?.()}
      />
      <SSignOutButton
        type="default"
        icon={<FontAwesomeIcon icon={faRightFromBracket} fixedWidth />}
        onClick={handleSignOut}
      >
        Выйти
      </SSignOutButton>
    </SWrapper>
  );
};

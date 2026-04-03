'use client';

import { usePathname } from 'next/navigation';
import { Button } from 'antd';
import {
  faAddressBook,
  faBars,
  faChartLine,
  faGlobe,
  faInbox,
  faList,
  faPaperPlane,
  faPenToSquare,
} from '@fortawesome/free-solid-svg-icons';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { routes } from '@/shared/config';

import {
  SWrapper,
  SBrand,
  SBrandTitle,
  SBrandSubtitle,
  SMeta,
  SSection,
  SSectionIcon,
  SSectionTitle,
} from './header.styles';

interface HeaderProps {
  onOpenMobileMenu?: () => void;
}

const sectionMeta: Record<string, { title: string; icon: IconDefinition }> = {
  [routes.HOME_PAGE]: { title: 'Аналитика', icon: faChartLine },
  [routes.MAILINGS_PAGE]: { title: 'Рассылки', icon: faPaperPlane },
  [routes.NEW_TEMPLATE_PAGE]: { title: 'Новый шаблон', icon: faPenToSquare },
  [routes.TEMPLATES_PAGE]: { title: 'Список шаблонов', icon: faList },
  [routes.CONTACTS_PAGE]: { title: 'Контакты', icon: faAddressBook },
  [routes.MAILBOXES_PAGE]: { title: 'Почтовые ящики', icon: faInbox },
  [routes.SETTINGS_PAGE]: { title: 'Домены', icon: faGlobe },
};

const getSection = (pathname: string) => {
  if (pathname === routes.HOME_PAGE) {
    return sectionMeta[routes.HOME_PAGE];
  }

  const key = Object.keys(sectionMeta).find(
    (route) =>
      route !== routes.HOME_PAGE && (pathname === route || pathname.startsWith(`${route}/`))
  );

  return key ? sectionMeta[key] : sectionMeta[routes.HOME_PAGE];
};

export const Header = ({ onOpenMobileMenu }: HeaderProps) => {
  const pathname = usePathname();
  const section = getSection(pathname);

  return (
    <SWrapper>
      <SBrand>
        <Button
          type="text"
          icon={<FontAwesomeIcon icon={faBars} fixedWidth />}
          onClick={onOpenMobileMenu}
          className="mobile-menu-toggle"
          aria-label="Открыть меню"
        />
        <SMeta>
          <SBrandTitle>MAILFINCH</SBrandTitle>
          <SBrandSubtitle>Единая панель управления рассылками</SBrandSubtitle>
        </SMeta>
      </SBrand>

      <SSection>
        <SSectionIcon>
          <FontAwesomeIcon icon={section.icon} fixedWidth />
        </SSectionIcon>
        <SSectionTitle>{section.title}</SSectionTitle>
      </SSection>
    </SWrapper>
  );
};

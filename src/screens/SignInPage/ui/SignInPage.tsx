'use client';

import React from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

import { SignInForm } from '@/entities/session';

import { SignInPageProps } from '../model/signInPage.types';
import {
  SPage,
  SContainer,
  SHero,
  SFeatureList,
  SFeatureItem,
  SQuote,
  SFormColumn,
  SCard,
  SBrand,
  SBrandName,
  SBrandBadge,
  STitle,
  SSubtitle,
  SCardTop,
  SCardTitle,
  SCardDescription,
  SFormSection,
  SFootnote,
} from './SignInPage.styles';

export const SignInPage = ({ callbackUrl }: SignInPageProps) => {
  const router = useRouter();
  const safeCallbackUrl = callbackUrl && callbackUrl.startsWith('/') ? callbackUrl : '/';

  const handleSignIn = async (values: { email: string; password: string }) => {
    const result = await signIn('credentials', { ...values, redirect: false });

    if (result?.error) return 'Неверный адрес электронной почты или пароль';

    const redirectTo = result?.url ?? safeCallbackUrl;
    router.push(redirectTo);

    return null;
  };

  return (
    <SPage>
      <SContainer>
        <SHero>
          <SBrand>
            <SBrandName>MAILFINCH</SBrandName>
            <SBrandBadge>Smart Email Platform</SBrandBadge>
          </SBrand>

          <STitle>Почтовая панель для вашего продукта</STitle>
          <SSubtitle>
            Управляйте доменами, ящиками, шаблонами и рассылками в одном аккуратном пространстве.
            Быстро, безопасно и без лишних шагов.
          </SSubtitle>

          <SFeatureList>
            <SFeatureItem>Единый контроль доменов, DNS и отправителей</SFeatureItem>
            <SFeatureItem>Шаблоны, аудитории и рассылки без ручной рутины</SFeatureItem>
            <SFeatureItem>Понятная аналитика по доставляемости и активности</SFeatureItem>
          </SFeatureList>

          <SQuote>
            Вход занимает секунды. После входа вы сразу попадаете в рабочее пространство без лишних
            экранов и скрытых действий.
          </SQuote>
        </SHero>

        <SFormColumn>
          <SCard>
            <SCardTop>
              <SCardTitle>Вход в аккаунт</SCardTitle>
              <SCardDescription>
                Используйте рабочий email и пароль, чтобы продолжить работу в Mailfinch.
              </SCardDescription>
            </SCardTop>
            <SFormSection>
              <SignInForm onSubmit={handleSignIn} />
            </SFormSection>
            <SFootnote>
              Защищенное соединение и безопасная авторизация включены по умолчанию.
            </SFootnote>
          </SCard>
        </SFormColumn>
      </SContainer>
    </SPage>
  );
};

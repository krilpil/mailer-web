'use client';

import React from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

import { SignInForm } from '@/entities/session';

import { SignInPageProps } from '../model/signInPage.types';
import {
  SPage,
  SCard,
  SBrand,
  SBrandName,
  STitle,
  SSubtitle,
  SFormSection,
} from './SignInPage.styles';

export const SignInPage = ({ callbackUrl }: SignInPageProps) => {
  const router = useRouter();
  const safeCallbackUrl = callbackUrl && callbackUrl.startsWith('/') ? callbackUrl : '/';

  const handleSignIn = async (values: { email: string; password: string }) => {
    const result = await signIn('credentials', { ...values, redirect: false });

    if (result?.error) return 'Неверный email или пароль';

    const redirectTo = result?.url ?? safeCallbackUrl;
    router.push(redirectTo);

    return null;
  };

  return (
    <SPage>
      <SBrand>
        <SBrandName>MAILFINCH</SBrandName>
      </SBrand>

      <STitle>Добро пожаловать</STitle>
      <SSubtitle>Войдите в свою учетную запись, чтобы продолжить</SSubtitle>

      <SCard>
        <SFormSection>
          <SignInForm onSubmit={handleSignIn} />
        </SFormSection>
      </SCard>
    </SPage>
  );
};

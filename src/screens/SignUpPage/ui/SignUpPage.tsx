'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

import { ConfirmationForm, ConfirmationFormProps, SignUpForm } from '@/entities/session';
import { routes } from '@/shared/config';
import { useSendOTPSignUp, useSubmitOTPSignUp } from '@/entities/auth/api';

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
} from './SignUpPage.styles';

type SignUpState = {
  stage: 'signUp' | 'confirmation';
  data: {
    email: string;
    password: string;
    otpCode: string;
    otpGUID: string;
    expiresAt: number;
  };
};

const initialSignUpState: SignUpState = {
  stage: 'signUp',
  data: { email: '', password: '', otpCode: '', otpGUID: '', expiresAt: 0 },
};

export const SignUpPage = () => {
  const router = useRouter();

  const sendOTPSignUp = useSendOTPSignUp();
  const submitOTPSignUp = useSubmitOTPSignUp();

  const [formSignUp, setFormSignUp] = useState<SignUpState>(initialSignUpState);
  const [signUpError, setSignUpError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  const handleSignUp = async (values: { email: string; password: string }) => {
    setSignUpError(null);
    setConfirmError(null);

    sendOTPSignUp
      .mutateAsync({ email: values.email })
      .then(({ data, success }) => {
        if (!success || !data) return;

        setFormSignUp(() => ({
          stage: 'confirmation',
          data: {
            ...initialSignUpState.data,
            email: values.email,
            password: values.password,
            otpGUID: data.otp_guid,
            expiresAt: data.expires_at,
          },
        }));
      })
      .catch((error) => {
        const details = (
          error as { details?: { msg?: string; error?: string; validation?: string[] } }
        ).details;
        const message =
          details?.msg ??
          details?.validation?.join(', ') ??
          (details?.error === 'account_exists'
            ? 'Аккаунт с таким email уже существует'
            : 'Не удалось отправить код');

        setSignUpError(message);
      });
  };

  const handleRepeatOTP = () => {
    setConfirmError(null);
    sendOTPSignUp
      .mutateAsync({ email: formSignUp.data.email })
      .then(({ data, success }) => {
        if (!success || !data) return;

        setFormSignUp((prevState) => ({
          ...prevState,
          data: {
            ...prevState.data,
            otpGUID: data.otp_guid,
            expiresAt: data.expires_at,
          },
        }));
      })
      .catch((error) => {
        const details = (
          error as { details?: { msg?: string; error?: string; validation?: string[] } }
        ).details;
        const message =
          details?.msg ??
          details?.validation?.join(', ') ??
          (details?.error === 'account_exists'
            ? 'Аккаунт с таким email уже существует'
            : 'Не удалось отправить код');

        setConfirmError(message);
      });
  };

  const handleConfirm: ConfirmationFormProps['onSubmitAction'] = async ({ otpCode }) => {
    setConfirmError(null);
    submitOTPSignUp
      .mutateAsync({
        email: formSignUp.data.email,
        otp_guid: formSignUp.data.otpGUID,
        otp_code: otpCode,
        password: formSignUp.data.password,
      })
      .then(() => {
        router.push(routes.AUTH_PAGE);
      })
      .catch((error) => {
        const details = (
          error as { details?: { msg?: string; error?: string; validation?: string[] } }
        ).details;
        const message =
          details?.msg ??
          details?.validation?.join(', ') ??
          (details?.error === 'otp_not_found'
            ? 'Неверный или просроченный код'
            : 'Не удалось подтвердить код');

        setConfirmError(message);
      });
  };

  return (
    <SPage>
      <SContainer>
        <SHero>
          <SBrand>
            <SBrandName>MAILFINCH</SBrandName>
            <SBrandBadge>Launch Faster</SBrandBadge>
          </SBrand>

          <STitle>Создайте аккаунт и запустите первую рассылку уже сегодня</STitle>
          <SSubtitle>
            Мы собрали работу с доменами, ящиками, шаблонами и аудиторией в один продуманный
            интерфейс. Без перегруза и сложных настроек на старте.
          </SSubtitle>

          <SFeatureList>
            <SFeatureItem>Быстрая регистрация и подтверждение по коду</SFeatureItem>
            <SFeatureItem>Единая панель для всей email-инфраструктуры</SFeatureItem>
            <SFeatureItem>Готово к масштабированию и аналитике отправок</SFeatureItem>
          </SFeatureList>

          <SQuote>
            После регистрации вы сразу получаете доступ к рабочему окружению, где каждая функция
            находится на своем месте.
          </SQuote>
        </SHero>

        <SFormColumn>
          <SCard>
            <SCardTop>
              <SCardTitle>Регистрация в Mailfinch</SCardTitle>
              <SCardDescription>
                Укажите email и пароль, затем подтвердите код из письма. Это займет меньше минуты.
              </SCardDescription>
            </SCardTop>

            <SFormSection>
              {formSignUp.stage === 'signUp' && (
                <SignUpForm onSubmitAction={handleSignUp} error={signUpError ?? undefined} />
              )}

              {formSignUp.stage === 'confirmation' && (
                <ConfirmationForm
                  expiresAt={formSignUp.data.expiresAt}
                  email={formSignUp.data.email}
                  onSubmitAction={handleConfirm}
                  onRepeatOTP={handleRepeatOTP}
                  error={confirmError ?? undefined}
                />
              )}
            </SFormSection>
            <SFootnote>
              Создавая аккаунт, вы принимаете правила безопасного использования платформы.
            </SFootnote>
          </SCard>
        </SFormColumn>
      </SContainer>
    </SPage>
  );
};

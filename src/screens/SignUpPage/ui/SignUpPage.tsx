'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

import { ConfirmationForm, ConfirmationFormProps, SignUpForm } from '@/entities/session';
import { routes } from '@/shared/config';
import { useSendOTPSignUp, useSubmitOTPSignUp } from '@/entities/auth/api';

import {
  SPage,
  SCard,
  SBrand,
  SBrandName,
  STitle,
  SSubtitle,
  SFormSection,
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
      <SBrand>
        <SBrandName>MAILFINCH</SBrandName>
      </SBrand>

      <STitle>Создать аккаунт</STitle>
      <SSubtitle>Пройдите регистрацию, чтобы начать работу</SSubtitle>

      <SCard>
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
      </SCard>
    </SPage>
  );
};

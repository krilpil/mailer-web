'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Button } from 'antd';
import { useFormik } from 'formik';
import * as yup from 'yup';

import {
  SFormWrapper,
  SDescription,
  SField,
  SLabel,
  SFieldError,
  SFormError,
  SInputOTP,
  SRepeatHint,
} from './ConfirmationForm.styles';
import { ConfirmationFormProps, ConfirmationFormValues } from '../../model/confirmationForm.types';

const OTP_LENGTH = 6;
const SECONDS_IN_MINUTE = 60;

const validationSchema = yup.object({
  otpCode: yup
    .string()
    .matches(new RegExp(`^\\d{${OTP_LENGTH}}$`), 'Введите 6-значный код')
    .required('Введите код'),
});

export const ConfirmationForm = ({
  email,
  expiresAt,
  onRepeatOTP,
  onSubmitAction,
  error,
}: ConfirmationFormProps) => {
  const [formError, setFormError] = useState<string | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);

  const formattedTimer = useMemo(() => {
    const minutes = Math.floor(remainingSeconds / SECONDS_IN_MINUTE)
      .toString()
      .padStart(2, '0');
    const seconds = (remainingSeconds % SECONDS_IN_MINUTE).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  }, [remainingSeconds]);

  useEffect(() => {
    const getRemaining = () =>
      Math.max(0, expiresAt - Math.floor(Date.now() / 1000));

    setRemainingSeconds(getRemaining());

    const intervalId = window.setInterval(() => {
      const nextRemaining = getRemaining();
      setRemainingSeconds(nextRemaining);
      if (nextRemaining <= 0) {
        window.clearInterval(intervalId);
      }
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [expiresAt]);

  const isExpired = remainingSeconds <= 0;

  const formik = useFormik<ConfirmationFormValues>({
    initialValues: { otpCode: '' },
    validationSchema,
    validateOnChange: false,
    validateOnBlur: true,
    onSubmit: async (values, { setSubmitting }) => {
      onSubmitAction(values);
      setSubmitting(false);
      setFormError(null);
    },
  });

  const otpError = formik.touched.otpCode && formik.errors.otpCode;

  const handleOtpInput = (cells: string[]) => {
    const value = cells.join('').replace(/\D/g, '').slice(0, OTP_LENGTH);
    formik.setFieldValue('otpCode', value, false);
    if (!formik.touched.otpCode) {
      formik.setFieldTouched('otpCode', true, false);
    }
  };

  return (
    <SFormWrapper onSubmit={formik.handleSubmit} noValidate>
      <SDescription>
        Введите код подтверждения, отправленный на почту{email ? ` ${email}` : ''}.
      </SDescription>

      <SField>
        <SLabel htmlFor="otpCode">Код подтверждения</SLabel>
        <SInputOTP
          length={OTP_LENGTH}
          value={formik.values.otpCode}
          formatter={(value) => value.replace(/\D/g, '')}
          onInput={handleOtpInput}
          onBlur={() => formik.setFieldTouched('otpCode', true, true)}
          status={otpError ? 'error' : undefined}
          inputMode="numeric"
          autoComplete="one-time-code"
        />
        {otpError && <SFieldError>{otpError}</SFieldError>}
      </SField>

      {(error || formError) && <SFormError>{error ?? formError}</SFormError>}

      {!isExpired && (
        <SRepeatHint>Отправить повторно можно через {formattedTimer}</SRepeatHint>
      )}

      {isExpired && (
        <Button type="default" block onClick={onRepeatOTP}>
          Отправить повторно
        </Button>
      )}

      <Button type="primary" htmlType="submit" block loading={formik.isSubmitting}>
        Подтвердить
      </Button>
    </SFormWrapper>
  );
};

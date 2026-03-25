'use client';

import React, { FC, useEffect, useMemo, useState } from 'react';
import { Button } from 'antd';
import { useFormik } from 'formik';
import * as yup from 'yup';

import { CreateDomainCodeProps, FormCreateCodeValue } from '../../model/createDomainProcess.types';
import {
  SDescription,
  SField,
  SFieldError,
  SFormWrapper,
  SInputOTP,
  SLabel,
  SRepeatHint,
} from './CreateDomainCode.styles';

const OTP_LENGTH = 6;
const SECONDS_IN_MINUTE = 60;

const validationSchema = yup.object({
  otpCode: yup
    .string()
    .matches(new RegExp(`^\\d{${OTP_LENGTH}}$`), 'Введите 6-значный код')
    .required('Введите код'),
});

const getRemainingSeconds = (expiresAt: number) => {
  const expiresAtMs = expiresAt > 1_000_000_000_000 ? expiresAt : expiresAt * 1000;
  return Math.max(0, Math.floor((expiresAtMs - Date.now()) / 1000));
};

export const CreateDomainCode: FC<CreateDomainCodeProps> = ({
  email,
  expiresAt,
  onRepeatOTP,
  onSubmit,
  error,
  onClearError,
}) => {
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const formik = useFormik<FormCreateCodeValue>({
    initialValues: { otpCode: '' },
    validationSchema,
    validateOnChange: false,
    validateOnBlur: true,
    onSubmit,
  });

  const formattedTimer = useMemo(() => {
    const minutes = Math.floor(remainingSeconds / SECONDS_IN_MINUTE)
      .toString()
      .padStart(2, '0');
    const seconds = (remainingSeconds % SECONDS_IN_MINUTE).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  }, [remainingSeconds]);

  useEffect(() => {
    const getRemaining = () => getRemainingSeconds(expiresAt);

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
  const validationError = formik.touched.otpCode ? formik.errors.otpCode : undefined;
  const otpError = validationError || error;
  const isComplete = formik.values.otpCode.length === OTP_LENGTH;
  const isSubmitDisabled = !isComplete || !formik.isValid;

  const handleOtpInput = (cells: string[]) => {
    const value = cells.join('').replace(/\D/g, '').slice(0, OTP_LENGTH);
    formik.setFieldValue('otpCode', value, false);
    if (error && onClearError) {
      onClearError();
    }
    if (!formik.touched.otpCode) {
      formik.setFieldTouched('otpCode', true, false);
    }
  };

  return (
    <SFormWrapper onSubmit={formik.handleSubmit} noValidate>
      <SDescription>Введите код подтверждения, отправленный на почту {email}.</SDescription>

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

      {!isExpired && <SRepeatHint>Отправить повторно можно через {formattedTimer}</SRepeatHint>}

      {isExpired && (
        <Button type="default" block onClick={onRepeatOTP}>
          Отправить повторно
        </Button>
      )}

      <Button htmlType="submit" type="primary" block disabled={isSubmitDisabled}>
        Далее
      </Button>
    </SFormWrapper>
  );
};

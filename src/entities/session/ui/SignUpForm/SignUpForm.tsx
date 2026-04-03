'use client';

import React, { useState } from 'react';
import { Button } from 'antd';
import { useFormik } from 'formik';
import * as yup from 'yup';

import {
  SFormWrapper,
  SField,
  SLabel,
  SStyledInput,
  SStyledPassword,
  SLinksRow,
  SInlineLink,
  SFormError,
  SFieldError,
} from './SignUpForm.styles';
import { SignUpFormProps, SignUpFormValues } from '../../model/signUpForm.types';

const validationSchema = yup.object({
  email: yup
    .string()
    .email('Введите корректный адрес электронной почты')
    .required('Укажите адрес электронной почты'),
  password: yup
    .string()
    .min(6, 'Пароль должен содержать минимум 6 символов')
    .required('Введите пароль'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Пароли не совпадают')
    .required('Подтвердите пароль'),
});

export const SignUpForm = ({ onSubmitAction, error }: SignUpFormProps) => {
  const [formError, setFormError] = useState<string | null>(null);

  const formik = useFormik<SignUpFormValues>({
    initialValues: { email: '', password: '', confirmPassword: '' },
    validationSchema,
    validateOnChange: false,
    validateOnBlur: true,
    onSubmit: async (values, { setSubmitting }) => {
      setFormError(null);
      onSubmitAction(values);
      setSubmitting(false);
    },
  });

  const emailError = formik.touched.email && formik.errors.email;
  const passwordError = formik.touched.password && formik.errors.password;
  const confirmPasswordError = formik.touched.confirmPassword && formik.errors.confirmPassword;

  return (
    <SFormWrapper onSubmit={formik.handleSubmit} noValidate>
      <SField>
        <SLabel htmlFor="email">Электронная почта</SLabel>
        <SStyledInput
          id="email"
          name="email"
          placeholder="Введите почтовый адрес"
          value={formik.values.email}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          status={emailError ? 'error' : undefined}
        />
        {emailError && <SFieldError>{emailError}</SFieldError>}
      </SField>

      <SField>
        <SLabel htmlFor="password">Пароль</SLabel>
        <SStyledPassword
          id="password"
          name="password"
          placeholder="Введите пароль"
          value={formik.values.password}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          status={passwordError ? 'error' : undefined}
        />
        {passwordError && <SFieldError>{passwordError}</SFieldError>}
      </SField>

      <SField>
        <SLabel htmlFor="confirmPassword">Подтвердите пароль</SLabel>
        <SStyledPassword
          id="confirmPassword"
          name="confirmPassword"
          placeholder="Повторите пароль"
          value={formik.values.confirmPassword}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          status={confirmPasswordError ? 'error' : undefined}
        />
        {confirmPasswordError && <SFieldError>{confirmPasswordError}</SFieldError>}
      </SField>

      {(error || formError) && <SFormError>{error ?? formError}</SFormError>}

      <Button type="primary" htmlType="submit" block loading={formik.isSubmitting}>
        Создать аккаунт
      </Button>

      <SLinksRow>
        <span>Уже есть аккаунт?</span>
        <SInlineLink href="/sign-in">Войти</SInlineLink>
      </SLinksRow>
    </SFormWrapper>
  );
};

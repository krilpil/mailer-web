'use client';

import React, { useState } from 'react';
import { Button } from 'antd';
import { useFormik } from 'formik';
import * as yup from 'yup';

import {
  FormWrapper,
  Field,
  Label,
  StyledInput,
  StyledPassword,
  LinksRow,
  InlineLink,
  FormError,
  RightLinkRow,
  FieldError,
} from './SignInForm.styles';
import { SignInFormValues, SignInFormProps } from '../../model/signInForm.types';

const validationSchema = yup.object({
  email: yup.string().email('Введите корректный email').required('Укажите email'),
  password: yup.string().required('Введите пароль'),
});

export const SignInForm = ({ onSubmit }: SignInFormProps) => {
  const [formError, setFormError] = useState<string | null>(null);

  const formik = useFormik<SignInFormValues>({
    initialValues: { email: '', password: '' },
    validationSchema,
    validateOnChange: false,
    validateOnBlur: true,
    onSubmit: async (values, { setSubmitting, setFieldError }) => {
      setFormError(null);
      try {
        const error = await onSubmit(values);
        if (error) {
          setFormError(error);
          setFieldError('password', ' ');
        }
      } catch {
        setFormError('Что-то пошло не так. Попробуйте ещё раз.');
      } finally {
        setSubmitting(false);
      }
    },
  });

  const emailError = formik.touched.email && formik.errors.email;
  const passwordError = formik.touched.password && formik.errors.password;

  return (
    <FormWrapper onSubmit={formik.handleSubmit} noValidate>
      <Field>
        <Label htmlFor="email">Электронная почта</Label>
        <StyledInput
          id="email"
          name="email"
          placeholder="you@company.com"
          value={formik.values.email}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          status={emailError ? 'error' : undefined}
        />
        {emailError && <FieldError>{emailError}</FieldError>}
      </Field>

      <Field>
        <Label htmlFor="password">Пароль</Label>
        <StyledPassword
          id="password"
          name="password"
          placeholder="Введите пароль"
          value={formik.values.password}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          status={passwordError ? 'error' : undefined}
        />
        {passwordError && <FieldError>{passwordError}</FieldError>}
      </Field>

      <RightLinkRow>
        <InlineLink href="/forgot-password">Забыли пароль?</InlineLink>
      </RightLinkRow>

      {formError && <FormError>{formError}</FormError>}

      <Button type="primary" htmlType="submit" block loading={formik.isSubmitting}>
        Войти
      </Button>

      <LinksRow>
        <span>Нет аккаунта?</span>
        <InlineLink href="/sign-up">Создать аккаунт</InlineLink>
      </LinksRow>
    </FormWrapper>
  );
};

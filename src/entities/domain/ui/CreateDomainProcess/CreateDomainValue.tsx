import React, { FC } from 'react';
import { Button, Form, FormItemProps, Input } from 'antd';
import { useFormik } from 'formik';
import * as yup from 'yup';

import {
  CreateDomainValueProps,
  FormCreateDomainValue,
} from '../../model/createDomainProcess.types';

const domainSchema = yup.object({
  domain: yup
    .string()
    .trim()
    .required('Введите домен')
    .matches(
      /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[A-Za-z]{2,}$/,
      'Неверный формат домена'
    ),
});

export const CreateDomainValue: FC<CreateDomainValueProps> = ({ onSubmit }) => {
  const { touched, errors, values, handleChange, handleBlur, handleSubmit, isValid } =
    useFormik<FormCreateDomainValue>({
      initialValues: { domain: '' },
      validationSchema: domainSchema,
      validateOnMount: true,
      onSubmit,
    });

  const domainError: FormItemProps['help'] = touched.domain ? errors.domain : undefined;
  const validateStatus: FormItemProps['validateStatus'] = domainError ? 'error' : undefined;

  return (
    <Form layout="vertical" onFinish={handleSubmit}>
      <p>Только домен, без www и http. Например &#34;example.com&#34;</p>

      <Form.Item validateStatus={validateStatus} help={domainError}>
        <Input
          name="domain"
          value={values.domain}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="example.com"
        />
      </Form.Item>

      <Button htmlType="submit" type="primary" disabled={!isValid}>
        Далее
      </Button>
    </Form>
  );
};

import React, { FC } from 'react';
import { Button, Form, FormItemProps, Input, Space } from 'antd';
import { useFormik } from 'formik';
import * as yup from 'yup';

import {
  CreateDomainEmailProps,
  FormCreateEmailValue,
} from '../../model/createDomainProcess.types';

const emailSchema = yup.object({
  localPart: yup
    .string()
    .trim()
    .required('Введите почту')
    .matches(/^[A-Za-z0-9._-]+$/, 'Неверный формат почты'),
});

export const CreateDomainEmail: FC<CreateDomainEmailProps> = ({ domain, onSubmit }) => {
  const { touched, errors, values, handleChange, handleBlur, handleSubmit, isValid } =
    useFormik<FormCreateEmailValue>({
      initialValues: { localPart: '' },
      validationSchema: emailSchema,
      validateOnMount: true,
      onSubmit,
    });

  const emailError: FormItemProps['help'] = touched.localPart ? errors.localPart : undefined;
  const validateStatus: FormItemProps['validateStatus'] = emailError ? 'error' : undefined;

  return (
    <Form layout="vertical" onFinish={handleSubmit}>
      <p>
        Введите почтовый адрес для этого домена. На него будет отправлено письмо с ссылкой для
        подтверждения
      </p>

      <Form.Item validateStatus={validateStatus} help={emailError}>
        <Space.Compact>
          <Input
            name="localPart"
            value={values.localPart}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="example"
          />
          <Space.Addon>@{domain}</Space.Addon>
        </Space.Compact>
      </Form.Item>

      <Button htmlType="submit" type="primary" disabled={!isValid}>
        Далее
      </Button>
    </Form>
  );
};

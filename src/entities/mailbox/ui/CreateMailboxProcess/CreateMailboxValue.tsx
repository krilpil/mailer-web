import React, { FC } from 'react';
import { Button, Form, FormItemProps, Input, Select, Space } from 'antd';
import { useFormik } from 'formik';
import * as yup from 'yup';

import {
  CreateMailboxValueProps,
  FormCreateMailboxValue,
} from '../../model/createMailboxProcess.types';

const mailboxSchema = yup.object({
  domain: yup.string().trim().required('Выберите домен'),
  localPart: yup
    .string()
    .trim()
    .required('Введите почту')
    .matches(/^[A-Za-z0-9._-]+$/, 'Неверный формат почты'),
});

export const CreateMailboxValue: FC<CreateMailboxValueProps> = ({ domains, onSubmit }) => {
  const hasDomains = domains.length > 0;
  const formik = useFormik<FormCreateMailboxValue>({
    initialValues: { domain: domains[0] ?? '', localPart: '' },
    validationSchema: mailboxSchema,
    validateOnMount: true,
    enableReinitialize: true,
    onSubmit,
  });

  const domainError: FormItemProps['help'] = formik.touched.domain
    ? formik.errors.domain
    : undefined;
  const domainValidateStatus: FormItemProps['validateStatus'] = domainError ? 'error' : undefined;
  const localPartError: FormItemProps['help'] = formik.touched.localPart
    ? formik.errors.localPart
    : undefined;
  const localPartValidateStatus: FormItemProps['validateStatus'] = localPartError
    ? 'error'
    : undefined;

  return (
    <Form layout="vertical" onFinish={formik.handleSubmit}>
      <p>Выберите домен и укажите часть адреса до символа @.</p>

      <Form.Item validateStatus={localPartValidateStatus} help={localPartError}>
        <Space.Compact>
          <Input
            name="localPart"
            value={formik.values.localPart}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder="moi_yashik"
          />
          <Select
            placeholder="Домен"
            value={formik.values.domain || undefined}
            onBlur={() => formik.setFieldTouched('domain', true, true)}
            onChange={(value) => formik.setFieldValue('domain', value, true)}
            options={domains.map((domain) => ({ label: domain, value: domain }))}
            disabled={!hasDomains}
          />
        </Space.Compact>
      </Form.Item>

      {(domainError || !hasDomains) && (
        <Form.Item validateStatus={domainValidateStatus} help={domainError}>
          {!hasDomains && 'Нет доступных доменов. Сначала добавьте домен.'}
        </Form.Item>
      )}

      <Button htmlType="submit" type="primary" disabled={!formik.isValid || !hasDomains}>
        Далее
      </Button>
    </Form>
  );
};

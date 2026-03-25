import React, { useState } from 'react';
import { Button } from 'antd';

import {
  CreateDomainEmail,
  CreateDomainValue,
  CreateDomainValueProps,
  CreateDomainEmailProps,
  CreateDomainCodeProps,
  CreateDomainCode,
} from '@/entities/domain';
import { useSendOTPCreateDomain, useSubmitOTPCreateDomain } from '@/entities/domain/api';

import { SModalCreate } from './createDomain.styles';

interface IFormCreateDomain {
  open: boolean;
  stage: 'value' | 'email' | 'code';
  data: {
    localPart: string;
    email: string;
    domain: string;
    otpCode: string;
    otpGUID: string;
    expiresAt: number;
  };
}

const formInitialValue: IFormCreateDomain = {
  open: false,
  stage: 'value',
  data: {
    localPart: '',
    email: '',
    domain: '',
    otpCode: '',
    otpGUID: '',
    expiresAt: 0,
  },
};

export const CreateDomain = () => {
  const [form, setForm] = useState<IFormCreateDomain>(formInitialValue);
  const [otpError, setOtpError] = useState<string | null>(null);

  const sendOTPCreateDomain = useSendOTPCreateDomain();
  const submitOTPCreateDomain = useSubmitOTPCreateDomain();

  const handleOpen = () => setForm((prevState) => ({ ...prevState, open: true }));
  const handleClose = () => setForm({ ...formInitialValue, open: false });
  const handleClearOtpError = () => setOtpError(null);

  const handleCreateDomainValue: CreateDomainValueProps['onSubmit'] = ({ domain }) => {
    setForm((prevState) => ({
      ...prevState,
      stage: 'email',
      data: { ...prevState.data, domain },
    }));
  };

  const handleCreateDomainEmail: CreateDomainEmailProps['onSubmit'] = ({ localPart }) => {
    const fullEmail = `${localPart}@${form.data.domain}`;
    handleClearOtpError();

    sendOTPCreateDomain.mutateAsync({ email: fullEmail }).then(({ otp_guid, expires_at }) => {
      setForm((prevState) => ({
        ...prevState,
        stage: 'code',
        data: {
          ...prevState.data,
          localPart: localPart,
          email: fullEmail,
          otpGUID: otp_guid,
          expiresAt: expires_at,
        },
      }));
    });
  };

  const handleCreateDomainCode: CreateDomainCodeProps['onSubmit'] = ({ otpCode }) => {
    if (!form.data.otpGUID || !form.data.domain || !form.data.localPart) return;

    handleClearOtpError();

    submitOTPCreateDomain
      .mutateAsync({
        otp: otpCode,
        otp_guid: form.data.otpGUID,
        domain: form.data.domain,
        local_part: form.data.localPart,
      })
      .then(() => {
        setForm((prevState) => ({
          ...prevState,
          data: { ...prevState.data, otpCode },
        }));
        handleClose();
        console.log(form);
      })
      .catch((error) => {
        const status = (error as { details?: { status?: number } })?.details?.status;
        if (status === 404) {
          setOtpError('Неверный код');
          return;
        }

        setOtpError('Не удалось подтвердить код');
      });
  };

  const handleRepeatOtp = () => {
    if (!form.data.email) return;

    handleClearOtpError();

    sendOTPCreateDomain.mutateAsync({ email: form.data.email }).then(({ otp_guid, expires_at }) => {
      setForm((prevState) => ({
        ...prevState,
        data: {
          ...prevState.data,
          otpGUID: otp_guid,
          expiresAt: expires_at,
        },
      }));
    });
  };

  return (
    <div>
      <SModalCreate open={form.open} onCancel={handleClose}>
        {form.stage === 'value' && <CreateDomainValue onSubmit={handleCreateDomainValue} />}
        {form.stage === 'email' && form.data.domain && (
          <CreateDomainEmail domain={form.data.domain} onSubmit={handleCreateDomainEmail} />
        )}
        {form.stage === 'code' && form.data.email && (
          <CreateDomainCode
            email={form.data.email}
            expiresAt={form.data.expiresAt}
            error={otpError ?? undefined}
            onClearError={handleClearOtpError}
            onRepeatOTP={handleRepeatOtp}
            onSubmit={handleCreateDomainCode}
          />
        )}
      </SModalCreate>

      <Button onClick={handleOpen} type={'primary'}>
        Добавить домен
      </Button>
    </div>
  );
};

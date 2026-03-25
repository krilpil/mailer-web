import React, { useMemo, useState } from 'react';
import { Button } from 'antd';

import { CreateDomainCode, CreateDomainCodeProps } from '@/entities/domain';
import { CreateMailboxValue, CreateMailboxValueProps } from '@/entities/mailbox';
import { useGetDomainsList } from '@/entities/domain/api';
import { useSendOTPCreateMailbox, useSubmitOTPCreateMailbox } from '@/entities/mailbox/api';

import { SModalCreate } from './createMailbox.styles';

interface IFormCreateMailbox {
  open: boolean;
  stage: 'value' | 'code';
  data: {
    localPart: string;
    email: string;
    domain: string;
    otpCode: string;
    otpGUID: string;
    expiresAt: number;
  };
}

const formInitialValue: IFormCreateMailbox = {
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

export const CreateMailbox = () => {
  const [form, setForm] = useState<IFormCreateMailbox>(formInitialValue);
  const [otpError, setOtpError] = useState<string | null>(null);

  const domainsList = useGetDomainsList();
  const sendOTPCreateMailbox = useSendOTPCreateMailbox();
  const submitOTPCreateMailbox = useSubmitOTPCreateMailbox();

  const domains = useMemo(
    () => (domainsList.data ?? []).map((item) => item.domain),
    [domainsList.data]
  );

  const handleOpen = () => setForm((prevState) => ({ ...prevState, open: true }));
  const handleClose = () => setForm({ ...formInitialValue, open: false });
  const handleClearOtpError = () => setOtpError(null);

  const handleCreateMailboxValue: CreateMailboxValueProps['onSubmit'] = ({
    domain,
    localPart,
  }) => {
    const fullEmail = `${localPart}@${domain}`;
    handleClearOtpError();

    sendOTPCreateMailbox
      .mutateAsync({ domain, local_part: localPart })
      .then(({ otp_guid, expires_at }) => {
        setForm((prevState) => ({
          ...prevState,
          stage: 'code',
          data: {
            ...prevState.data,
            localPart,
            email: fullEmail,
            domain,
            otpGUID: otp_guid,
            expiresAt: expires_at,
          },
        }));
      });
  };

  const handleCreateMailboxCode: CreateDomainCodeProps['onSubmit'] = ({ otpCode }) => {
    if (!form.data.otpGUID || !form.data.domain || !form.data.localPart) return;

    handleClearOtpError();

    submitOTPCreateMailbox
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
    if (!form.data.domain || !form.data.localPart) return;

    handleClearOtpError();

    sendOTPCreateMailbox
      .mutateAsync({ domain: form.data.domain, local_part: form.data.localPart })
      .then(({ otp_guid, expires_at }) => {
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
        {form.stage === 'value' && (
          <CreateMailboxValue domains={domains} onSubmit={handleCreateMailboxValue} />
        )}
        {form.stage === 'code' && form.data.email && (
          <CreateDomainCode
            email={form.data.email}
            expiresAt={form.data.expiresAt}
            error={otpError ?? undefined}
            onClearError={handleClearOtpError}
            onRepeatOTP={handleRepeatOtp}
            onSubmit={handleCreateMailboxCode}
          />
        )}
      </SModalCreate>

      <Button onClick={handleOpen} type={'primary'}>
        Добавить почтовый ящик
      </Button>
    </div>
  );
};

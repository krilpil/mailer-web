import { AxiosError } from 'axios';
import { ValidationError } from 'yup';
import { useMutation } from '@tanstack/react-query';

import { API, DetailsError } from '@/shared/api';

import { sendOTPCreateMailboxResponseValidate } from './sendOTPCreateMailbox.validation';
import {
  ISendOTPCreateMailboxPayload,
  ISendOTPCreateMailboxResponse,
} from './sendOTPCreateMailbox.types';

const sendOTPCreateMailboxKey = 'sendOTPCreateMailbox';

const sendOTPCreateMailbox = async ({
  domain,
  local_part,
}: ISendOTPCreateMailboxPayload): Promise<ISendOTPCreateMailboxResponse> => {
  return API<ISendOTPCreateMailboxResponse>({
    url: `/api/mailbox/create/otp`,
    method: 'POST',
    data: {
      domain,
      local_part,
    },
  })
    .then(({ data }) => sendOTPCreateMailboxResponseValidate.validate(data, { abortEarly: false }))
    .catch((error: AxiosError | ValidationError) => {
      const errorName = 'mailboxes/sendOTPCreateMailbox';

      if (error instanceof AxiosError) {
        throw new DetailsError(errorName, { status: error.response?.status });
      } else {
        const validation = error.inner.map((error) => error.message);
        throw new DetailsError(errorName, { validation });
      }
    });
};

export const useSendOTPCreateMailbox = () =>
  useMutation({
    mutationKey: [sendOTPCreateMailboxKey],
    mutationFn: (payload: ISendOTPCreateMailboxPayload) => sendOTPCreateMailbox(payload),
  });

export * from './sendOTPCreateMailbox.types';

import { AxiosError } from 'axios';
import { ValidationError } from 'yup';
import { useMutation } from '@tanstack/react-query';

import { API, DetailsError } from '@/shared/api';

import { sendOTPCreateDomainResponseValidate } from './sendOTPCreateDomain.validation';
import {
  ISendOTPCreateDomainPayload,
  ISendOTPCreateDomainResponse,
} from './sendOTPCreateDomain.types';

const sendOTPCreateDomainKey = 'sendOTPCreateDomain';

const sendOTPCreateDomain = async ({
  email,
}: ISendOTPCreateDomainPayload): Promise<ISendOTPCreateDomainResponse> => {
  return API<ISendOTPCreateDomainResponse>({
    url: `/api/domains/create/otp`,
    method: 'POST',
    data: {
      email,
    },
  })
    .then(({ data }) => sendOTPCreateDomainResponseValidate.validate(data, { abortEarly: false }))
    .catch((error: AxiosError | ValidationError) => {
      const errorName = 'domains/sendOTPCreateDomain';

      if (error instanceof AxiosError) {
        throw new DetailsError(errorName, { status: error.response?.status });
      } else {
        const validation = error.inner.map((error) => error.message);
        throw new DetailsError(errorName, { validation });
      }
    });
};

export const useSendOTPCreateDomain = () =>
  useMutation({
    mutationKey: [sendOTPCreateDomainKey],
    mutationFn: (payload: ISendOTPCreateDomainPayload) => sendOTPCreateDomain(payload),
  });

export * from './sendOTPCreateDomain.types';

import { AxiosError } from 'axios';
import { ValidationError } from 'yup';
import { useMutation } from '@tanstack/react-query';

import { API, DetailsError } from '@/shared/api';

import { sendOTPSignUpResponseValidate } from './sendOTPSignUp.validation';
import { ISendOTPSignUpPayload, ISendOTPSignUpResponse } from './sendOTPSignUp.types';

const sendOTPSignUpKey = 'sendOTPSignUp';

const sendOTPSignUp = async ({ email }: ISendOTPSignUpPayload): Promise<ISendOTPSignUpResponse> => {
  return API<ISendOTPSignUpResponse>({
    url: `/api/sign-up/otp`,
    method: 'POST',
    data: {
      email,
    },
  })
    .then(({ data }) => sendOTPSignUpResponseValidate.validate(data, { abortEarly: false }))
    .catch((error: AxiosError | ValidationError) => {
      const errorName = 'auth/sendOTPSignUp';

      if (error instanceof AxiosError) {
        const responseData = error.response?.data as { msg?: string; error?: string } | undefined;
        throw new DetailsError(errorName, {
          status: error.response?.status,
          msg: responseData?.msg,
          error: responseData?.error,
        });
      } else {
        const validation = error.inner.map((error) => error.message);
        throw new DetailsError(errorName, { validation });
      }
    });
};

export const useSendOTPSignUp = () =>
  useMutation({
    mutationKey: [sendOTPSignUpKey],
    mutationFn: (payload: ISendOTPSignUpPayload) => sendOTPSignUp(payload),
  });

export * from './sendOTPSignUp.types';

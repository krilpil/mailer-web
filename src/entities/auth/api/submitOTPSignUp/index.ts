import { AxiosError } from 'axios';
import { ValidationError } from 'yup';
import { useMutation } from '@tanstack/react-query';

import { API, DetailsError } from '@/shared/api';

import { submitOTPSignUpResponseValidate } from './submitOTPSignUp.validation';
import { ISubmitOTPSignUpPayload, ISubmitOTPSignUpResponse } from './submitOTPSignUp.types';

const submitOTPSignUpKey = 'submitOTPSignUp';

const submitOTPSignUp = async ({
  otp_guid,
  email,
  otp_code,
  password,
}: ISubmitOTPSignUpPayload): Promise<ISubmitOTPSignUpResponse> => {
  return API<ISubmitOTPSignUpResponse>({
    url: `/api/sign-up`,
    method: 'POST',
    data: {
      otp_guid,
      email,
      otp_code,
      password,
    },
  })
    .then(({ data }) => submitOTPSignUpResponseValidate.validate(data, { abortEarly: false }))
    .catch((error: AxiosError | ValidationError) => {
      const errorName = 'auth/submitOTPSignUp';

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

export const useSubmitOTPSignUp = () =>
  useMutation({
    mutationKey: [submitOTPSignUpKey],
    mutationFn: (payload: ISubmitOTPSignUpPayload) => submitOTPSignUp(payload),
  });

export * from './submitOTPSignUp.types';

import { AxiosError } from 'axios';
import { useMutation } from '@tanstack/react-query';

import { API, DetailsError, queryClient } from '@/shared/api';
import { getDomainsListKey } from '@/entities/domain/api';

import { ISubmitOTPCreateDomainPayload } from './submitOTPCreateDomain.types';

const submitOTPCreateDomainKey = 'submitOTPCreateDomain';

const submitOTPCreateDomain = async ({
  otp,
  otp_guid,
  domain,
  local_part,
}: ISubmitOTPCreateDomainPayload) => {
  return API({
    url: `/api/domains/create`,
    method: 'POST',
    data: {
      otp,
      otp_guid,
      domain,
      local_part,
    },
  })
    .then(({ data }) => data)
    .catch((error: AxiosError) => {
      const errorName = 'domains/submitOTPCreateDomain';
      throw new DetailsError(errorName, { status: error.response?.status });
    });
};

export const useSubmitOTPCreateDomain = () =>
  useMutation({
    mutationKey: [submitOTPCreateDomainKey],
    mutationFn: (payload: ISubmitOTPCreateDomainPayload) => submitOTPCreateDomain(payload),
    onSuccess: async () => {
      await queryClient.refetchQueries({ queryKey: [getDomainsListKey] });
    },
  });

export * from './submitOTPCreateDomain.types';

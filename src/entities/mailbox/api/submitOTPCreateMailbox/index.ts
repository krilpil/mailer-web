import { AxiosError } from 'axios';
import { useMutation } from '@tanstack/react-query';

import { API, DetailsError, queryClient } from '@/shared/api';
import { getMailboxesListKey } from '@/entities/mailbox/api';

import { ISubmitOTPCreateMailboxPayload } from './submitOTPCreateMailbox.types';

const submitOTPCreateMailboxKey = 'submitOTPCreateMailbox';

const submitOTPCreateMailbox = async ({
  otp,
  otp_guid,
  domain,
  local_part,
}: ISubmitOTPCreateMailboxPayload) => {
  return API({
    url: `/api/mailbox/create`,
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
      const errorName = 'mailboxes/submitOTPCreateMailbox';
      throw new DetailsError(errorName, { status: error.response?.status });
    });
};

export const useSubmitOTPCreateMailbox = () =>
  useMutation({
    mutationKey: [submitOTPCreateMailboxKey],
    mutationFn: (payload: ISubmitOTPCreateMailboxPayload) => submitOTPCreateMailbox(payload),
    onSuccess: async () => {
      await queryClient.refetchQueries({ queryKey: [getMailboxesListKey] });
    },
  });

export * from './submitOTPCreateMailbox.types';

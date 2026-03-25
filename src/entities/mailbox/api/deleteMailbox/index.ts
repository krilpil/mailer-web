import { AxiosError } from 'axios';
import { ValidationError } from 'yup';
import { useMutation } from '@tanstack/react-query';

import { API, DetailsError, queryClient } from '@/shared/api';
import { getMailboxesListKey } from '@/entities/mailbox/api';

import { deleteMailboxResponseValidate } from './deleteMailbox.validation';
import { IDeleteMailboxPayload, IDeleteMailboxResponse } from './deleteMailbox.types';

const deleteMailboxKey = 'deleteMailbox';

const deleteMailbox = async ({
  username,
}: IDeleteMailboxPayload): Promise<IDeleteMailboxResponse> => {
  return API<IDeleteMailboxResponse>({
    url: `/api/mailbox/delete`,
    method: 'POST',
    data: {
      username,
    },
  })
    .then(({ data }) => deleteMailboxResponseValidate.validate(data, { abortEarly: false }))
    .catch((error: AxiosError | ValidationError) => {
      const errorName = 'mailboxes/deleteMailbox';

      if (error instanceof AxiosError) {
        throw new DetailsError(errorName, { status: error.response?.status });
      } else {
        const validation = error.inner.map((error) => error.message);
        throw new DetailsError(errorName, { validation });
      }
    });
};

export const useDeleteMailbox = () =>
  useMutation({
    mutationKey: [deleteMailboxKey],
    mutationFn: (payload: IDeleteMailboxPayload) => deleteMailbox(payload),
    onSuccess: async () => {
      await queryClient.refetchQueries({ queryKey: [getMailboxesListKey] });
    },
  });

export * from './deleteMailbox.types';

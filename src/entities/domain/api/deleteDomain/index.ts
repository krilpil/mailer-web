import { AxiosError } from 'axios';
import { ValidationError } from 'yup';
import { useMutation } from '@tanstack/react-query';

import { API, DetailsError, queryClient } from '@/shared/api';
import { getDomainsListKey } from '@/entities/domain/api';

import { deleteDomainResponseValidate } from './deleteDomain.validation';
import { IDeleteDomainPayload, IDeleteDomainResponse } from './deleteDomain.types';

const deleteDomainKey = 'deleteDomain';

const deleteDomain = async ({ domain }: IDeleteDomainPayload): Promise<IDeleteDomainResponse> => {
  return API<IDeleteDomainResponse>({
    url: `/api/domains/delete`,
    method: 'POST',
    data: {
      domain,
    },
  })
    .then(({ data }) => deleteDomainResponseValidate.validate(data, { abortEarly: false }))
    .catch((error: AxiosError | ValidationError) => {
      const errorName = 'domains/deleteDomain';

      if (error instanceof AxiosError) {
        throw new DetailsError(errorName, { status: error.response?.status });
      } else {
        const validation = error.inner.map((error) => error.message);
        throw new DetailsError(errorName, { validation });
      }
    });
};

export const useDeleteDomain = () =>
  useMutation({
    mutationKey: [deleteDomainKey],
    mutationFn: (payload: IDeleteDomainPayload) => deleteDomain(payload),
    onSuccess: async () => {
      await queryClient.refetchQueries({ queryKey: [getDomainsListKey] });
    },
  });

export * from './deleteDomain.types';

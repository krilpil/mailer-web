import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { ValidationError } from 'yup';

import { API, DetailsError } from '@/shared/api';

import { IFreshDNSRecordsPayload, IFreshDNSRecordsResponse } from './freshDNSRecords.types';
import { freshDNSRecordsResponseValidate } from './freshDNSRecords.validation';

const freshDNSRecordsKey = 'freshDNSRecords';

const freshDNSRecords = async ({
  domain,
}: IFreshDNSRecordsPayload): Promise<IFreshDNSRecordsResponse> => {
  return API<IFreshDNSRecordsResponse>({
    url: `/api/domains/fresh_dns_records`,
    method: 'POST',
    data: {
      domain,
    },
  })
    .then(({ data }) => freshDNSRecordsResponseValidate.validate(data, { abortEarly: false }))
    .catch((error: AxiosError | ValidationError) => {
      const errorName = 'domains/freshDNSRecords';

      if (error instanceof AxiosError) {
        throw new DetailsError(errorName, {
          status: error.response?.status,
          msg: error.response?.data?.msg,
          error: error.response?.data?.error,
        });
      } else {
        const validation = error.inner.map((error) => error.message);
        throw new DetailsError(errorName, { validation });
      }
    });
};

export const useFreshDNSRecords = () =>
  useMutation({
    mutationKey: [freshDNSRecordsKey],
    mutationFn: (payload: IFreshDNSRecordsPayload) => freshDNSRecords(payload),
  });

export * from './freshDNSRecords.types';

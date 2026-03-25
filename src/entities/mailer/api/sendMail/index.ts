import { AxiosError } from 'axios';
import { ValidationError } from 'yup';
import { useMutation } from '@tanstack/react-query';

import { API, DetailsError } from '@/shared/api';

import { sendMailResponseValidate } from './sendMail.validation';
import { ISendMailPayload, ISendMailResponse } from './sendMail.types';

const sendMailKey = 'sendMail';

const sendMail = async ({ recipient, attribs }: ISendMailPayload): Promise<ISendMailResponse> => {
  return API<ISendMailResponse>({
    url: `/api/mailing/sendMail`,
    method: 'POST',
    data: {
      recipient,
      attribs,
    },
  })
    .then(({ data }) => sendMailResponseValidate.validate(data, { abortEarly: false }))
    .catch((error: AxiosError | ValidationError) => {
      const errorName = 'mailer/sendMail';

      if (error instanceof AxiosError) {
        throw new DetailsError(errorName, { status: error.response?.status });
      } else {
        const validation = error.inner.map((error) => error.message);
        throw new DetailsError(errorName, { validation });
      }
    });
};

export const useSendMail = () =>
  useMutation({
    mutationKey: [sendMailKey],
    mutationFn: (payload: ISendMailPayload) => sendMail(payload),
  });

export * from './sendMail.types';

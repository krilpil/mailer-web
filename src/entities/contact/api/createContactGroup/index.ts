import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { ValidationError } from 'yup';

import { API, DetailsError, queryClient } from '@/shared/api';
import { getContactGroupsListKey } from '@/entities/contact/api';

import {
  ICreateContactGroupPayload,
  ICreateContactGroupResponse,
} from './createContactGroup.types';
import { createContactGroupResponseValidate } from './createContactGroup.validation';

const createContactGroupKey = 'createContactGroup';

const createContactGroup = async (
  payload: ICreateContactGroupPayload
): Promise<ICreateContactGroupResponse> => {
  return API<ICreateContactGroupResponse>({
    url: `/api/contact/group/create`,
    method: 'POST',
    data: {
      name: payload.name,
      description: payload.description,
      double_optin: payload.double_optin,
    },
  })
    .then(({ data }) => createContactGroupResponseValidate.validate(data, { abortEarly: false }))
    .catch((error: AxiosError | ValidationError) => {
      const errorName = 'contacts/createContactGroup';

      if (error instanceof AxiosError) {
        throw new DetailsError(errorName, { status: error.response?.status });
      } else {
        const validation = error.inner.map((item) => item.message);
        throw new DetailsError(errorName, { validation });
      }
    });
};

export const useCreateContactGroup = () =>
  useMutation({
    mutationKey: [createContactGroupKey],
    mutationFn: (payload: ICreateContactGroupPayload) => createContactGroup(payload),
    onSuccess: async () => {
      await queryClient.refetchQueries({ queryKey: [getContactGroupsListKey] });
    },
  });

export * from './createContactGroup.types';

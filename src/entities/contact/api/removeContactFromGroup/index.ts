import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { ValidationError } from 'yup';

import { API, DetailsError, queryClient } from '@/shared/api';
import { getContactGroupContactsKey, getContactGroupsListKey } from '@/entities/contact/api';

import {
  IRemoveContactFromGroupPayload,
  IRemoveContactFromGroupResponse,
} from './removeContactFromGroup.types';
import { removeContactFromGroupResponseValidate } from './removeContactFromGroup.validation';

const removeContactFromGroupKey = 'removeContactFromGroup';

const removeContactFromGroup = async (
  payload: IRemoveContactFromGroupPayload
): Promise<IRemoveContactFromGroupResponse> => {
  return API<IRemoveContactFromGroupResponse>({
    url: `/api/contact/group/recipient/remove`,
    method: 'POST',
    data: {
      group_id: payload.group_id,
      email: payload.email,
      active: payload.active,
    },
  })
    .then(({ data }) =>
      removeContactFromGroupResponseValidate.validate(data, { abortEarly: false })
    )
    .catch((error: AxiosError | ValidationError) => {
      const errorName = 'contacts/removeContactFromGroup';

      if (error instanceof AxiosError) {
        throw new DetailsError(errorName, { status: error.response?.status });
      } else {
        const validation = error.inner.map((item) => item.message);
        throw new DetailsError(errorName, { validation });
      }
    });
};

export const useRemoveContactFromGroup = () =>
  useMutation({
    mutationKey: [removeContactFromGroupKey],
    mutationFn: (payload: IRemoveContactFromGroupPayload) => removeContactFromGroup(payload),
    onSuccess: async (_, variables) => {
      await queryClient.refetchQueries({
        queryKey: [getContactGroupContactsKey, variables.group_id],
      });
      await queryClient.refetchQueries({ queryKey: [getContactGroupsListKey] });
    },
  });

export * from './removeContactFromGroup.types';

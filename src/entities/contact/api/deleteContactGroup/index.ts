import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { ValidationError } from 'yup';

import { API, DetailsError, queryClient } from '@/shared/api';
import { getContactGroupsListKey } from '@/entities/contact/api';

import {
  IDeleteContactGroupPayload,
  IDeleteContactGroupResponse,
} from './deleteContactGroup.types';
import { deleteContactGroupResponseValidate } from './deleteContactGroup.validation';

const deleteContactGroupKey = 'deleteContactGroup';

const deleteContactGroup = async (
  payload: IDeleteContactGroupPayload
): Promise<IDeleteContactGroupResponse> => {
  return API<IDeleteContactGroupResponse>({
    url: `/api/contact/group/delete`,
    method: 'POST',
    data: {
      group_id: payload.group_id,
    },
  })
    .then(({ data }) => deleteContactGroupResponseValidate.validate(data, { abortEarly: false }))
    .catch((error: AxiosError | ValidationError) => {
      const errorName = 'contacts/deleteContactGroup';

      if (error instanceof AxiosError) {
        throw new DetailsError(errorName, { status: error.response?.status });
      } else {
        const validation = error.inner.map((item) => item.message);
        throw new DetailsError(errorName, { validation });
      }
    });
};

export const useDeleteContactGroup = () =>
  useMutation({
    mutationKey: [deleteContactGroupKey],
    mutationFn: (payload: IDeleteContactGroupPayload) => deleteContactGroup(payload),
    onSuccess: async () => {
      await queryClient.refetchQueries({ queryKey: [getContactGroupsListKey] });
    },
  });

export * from './deleteContactGroup.types';

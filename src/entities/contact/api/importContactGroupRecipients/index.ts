import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { ValidationError } from 'yup';

import { API, DetailsError, queryClient } from '@/shared/api';
import { getContactGroupsListKey } from '@/entities/contact/api';

import {
  IImportContactGroupRecipientsPayload,
  IImportContactGroupRecipientsResponse,
} from './importContactGroupRecipients.types';
import { importContactGroupRecipientsResponseValidate } from './importContactGroupRecipients.validation';

const importContactGroupRecipientsKey = 'importContactGroupRecipients';

const importContactGroupRecipients = async (
  payload: IImportContactGroupRecipientsPayload
): Promise<IImportContactGroupRecipientsResponse> => {
  return API<IImportContactGroupRecipientsResponse>({
    url: `/api/contact/group/import`,
    method: 'POST',
    data: {
      group_ids: payload.group_ids,
      recipients: payload.recipients,
      file_data: payload.file_data,
      file_type: payload.file_type,
      default_active: payload.default_active,
      status: payload.status,
      overwrite: payload.overwrite,
    },
  })
    .then(({ data }) =>
      importContactGroupRecipientsResponseValidate.validate(data, { abortEarly: false })
    )
    .catch((error: AxiosError | ValidationError) => {
      const errorName = 'contacts/importContactGroupRecipients';

      if (error instanceof AxiosError) {
        throw new DetailsError(errorName, { status: error.response?.status });
      } else {
        const validation = error.inner.map((item) => item.message);
        throw new DetailsError(errorName, { validation });
      }
    });
};

export const useImportContactGroupRecipients = () =>
  useMutation({
    mutationKey: [importContactGroupRecipientsKey],
    mutationFn: (payload: IImportContactGroupRecipientsPayload) =>
      importContactGroupRecipients(payload),
    onSuccess: async () => {
      await queryClient.refetchQueries({ queryKey: [getContactGroupsListKey] });
    },
  });

export * from './importContactGroupRecipients.types';

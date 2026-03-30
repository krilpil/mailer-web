import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { ValidationError } from 'yup';

import { API, DetailsError } from '@/shared/api';

import {
  IGetContactGroupContactsPayload,
  IGetContactGroupContactsResponse,
} from './getContactGroupContacts.types';
import { getContactGroupContactsResponseValidate } from './getContactGroupContacts.validation';

export const getContactGroupContactsKey = 'getContactGroupContacts';

export const getContactGroupContacts = async (
  payload: IGetContactGroupContactsPayload
): Promise<IGetContactGroupContactsResponse> => {
  return API<IGetContactGroupContactsResponse>({
    url: `/api/contact/group/contacts`,
    method: 'GET',
    params: {
      group_id: payload.group_id,
    },
  })
    .then(({ data }) =>
      getContactGroupContactsResponseValidate.validate(data, { abortEarly: false })
    )
    .catch((error: AxiosError | ValidationError) => {
      const errorName = 'contacts/getContactGroupContacts';

      if (error instanceof AxiosError) {
        throw new DetailsError(errorName, { status: error.response?.status });
      } else {
        const validation = error.inner.map((item) => item.message);
        throw new DetailsError(errorName, { validation });
      }
    });
};

export const useGetContactGroupContacts = (groupId: number | null) =>
  useQuery({
    queryKey: [getContactGroupContactsKey, groupId],
    queryFn: () => getContactGroupContacts({ group_id: groupId as number }),
    enabled: Boolean(groupId),
    select: (data) => data.data.list,
  });

export * from './getContactGroupContacts.types';

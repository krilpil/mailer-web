import { mixed, object, ObjectSchema, string, number } from 'yup';

import { IRemoveRecipientFromGroupPayload } from './removeRecipientFromGroup.types';

export const removeRecipientFromGroupPayloadValidate: ObjectSchema<IRemoveRecipientFromGroupPayload> =
  object({
    group_id: number().required().integer().positive(),
    email: string().required().email(),
    active: mixed<0 | 1>().required().oneOf([0, 1]),
  }).required();

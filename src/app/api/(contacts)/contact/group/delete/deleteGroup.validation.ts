import { number, object, ObjectSchema } from 'yup';

import { IDeleteGroupPayload } from './deleteGroup.types';

export const deleteGroupPayloadValidate: ObjectSchema<IDeleteGroupPayload> = object({
  group_id: number().required().integer().positive(),
}).required();

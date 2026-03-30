import { mixed, object, ObjectSchema, string } from 'yup';

import { ICreateGroupPayload } from './createGroup.types';

export const createGroupPayloadValidate: ObjectSchema<ICreateGroupPayload> = object({
  name: string().trim().required(),
  description: string().trim().optional(),
  double_optin: mixed<0 | 1>().oneOf([0, 1]).optional(),
}).required();

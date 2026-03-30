import { boolean, object, ObjectSchema, string } from 'yup';

import { IRemoveContactFromGroupResponse } from './removeContactFromGroup.types';

export const removeContactFromGroupResponseValidate: ObjectSchema<IRemoveContactFromGroupResponse> =
  object({
    success: boolean().required(),
    msg: string().required(),
    error: string().optional(),
  }).required();

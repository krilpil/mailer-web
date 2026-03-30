import { boolean, object, ObjectSchema, string } from 'yup';

import { IDeleteContactGroupResponse } from './deleteContactGroup.types';

export const deleteContactGroupResponseValidate: ObjectSchema<IDeleteContactGroupResponse> = object(
  {
    success: boolean().required(),
    msg: string().required(),
    error: string().optional(),
  }
).required();

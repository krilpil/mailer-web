import { boolean, object, ObjectSchema, string } from 'yup';

import { IDeleteDomainResponse } from './deleteDomain.types';

export const deleteDomainResponseValidate: ObjectSchema<IDeleteDomainResponse> = object({
  success: boolean().required(),
  msg: string().required(),
  error: string().optional(),
}).required();

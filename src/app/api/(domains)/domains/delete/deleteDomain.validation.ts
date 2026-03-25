import { object, ObjectSchema, string } from 'yup';

import { IDeleteDomainPayload } from './deleteDomain.types';

export const deleteDomainPayloadValidate: ObjectSchema<IDeleteDomainPayload> = object({
  domain: string().required(),
}).required();

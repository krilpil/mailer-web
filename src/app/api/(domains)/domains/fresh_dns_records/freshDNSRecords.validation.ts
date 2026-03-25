import { object, ObjectSchema, string } from 'yup';

import { IFreshDNSRecordsPayload } from './freshDNSRecords.types';

export const freshDNSRecordsPayloadValidate: ObjectSchema<IFreshDNSRecordsPayload> = object({
  domain: string().required(),
}).required();

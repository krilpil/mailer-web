import { boolean, object, ObjectSchema, string } from 'yup';

import { IFreshDNSRecordsResponse } from './freshDNSRecords.types';

const dnsRecordValidate = object({
  type: string().required(),
  host: string().required(),
  value: string().required(),
  valid: boolean().required(),
}).required();

const dnsRecordsValidate = object({
  spf: dnsRecordValidate,
  dkim: dnsRecordValidate,
  dkim_short: dnsRecordValidate,
  dmarc: dnsRecordValidate,
  mx: dnsRecordValidate,
  a: dnsRecordValidate,
  ptr: dnsRecordValidate,
}).required();

export const freshDNSRecordsResponseValidate: ObjectSchema<IFreshDNSRecordsResponse> = object({
  success: boolean().required(),
  msg: string().required(),
  error: string().optional(),
  data: dnsRecordsValidate.required(),
}).required();

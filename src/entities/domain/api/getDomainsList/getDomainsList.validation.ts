import { array, boolean, mixed, number, object, string, ObjectSchema } from 'yup';

import { IGetDomainsListResponse } from './getDomainsList.types';

const dnsRecordValidate = object({
  type: string().required(),
  host: string().required(),
  value: string().required(),
  valid: boolean().required(),
}).required();

export const getDomainsListResponseValidate: ObjectSchema<IGetDomainsListResponse> = object({
  success: boolean().required(),
  msg: string().required(),
  data: object({
    total: number().required(),
    list: array()
      .of(
        object({
          domain: string().required(),
          active: mixed<0 | 1>().oneOf([0, 1]).required(),
          create_time: number().required(),
          mailboxes: number().required(),
          dns_records: object({
            spf: dnsRecordValidate,
            dkim: dnsRecordValidate,
            dkim_short: dnsRecordValidate,
            dmarc: dnsRecordValidate,
            mx: dnsRecordValidate,
            a: dnsRecordValidate,
            ptr: dnsRecordValidate,
          }).required(),
        }).required()
      )
      .required(),
  }).required(),
}).required();

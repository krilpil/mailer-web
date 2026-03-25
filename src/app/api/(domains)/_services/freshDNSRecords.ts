import axios from 'axios';

import {
  IFreshDNSRecordsPayload,
  IFreshDNSRecordsResponse,
} from '../domains/fresh_dns_records/freshDNSRecords.types';

export const fetchFreshDNSRecords = async (payload: IFreshDNSRecordsPayload) => {
  return axios<IFreshDNSRecordsResponse>({
    url: `${process.env.BILLION_MAIL_API}/domains/fresh_dns_records`,
    method: 'POST',
    headers: {
      authorization: `${process.env.BILLION_MAIL_TOKEN}`,
      'Content-Type': 'application/json;charset=UTF-8',
    },
    data: {
      domain: payload.domain,
    },
  });
};

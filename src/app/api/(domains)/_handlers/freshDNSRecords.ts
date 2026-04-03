import { AxiosError } from 'axios';
import { NextResponse } from 'next/server';

import { parseAndValidate } from '@/app/api/_utils/request';

import { freshDNSRecordsPayloadValidate } from '../domains/fresh_dns_records/freshDNSRecords.validation';
import {
  IFreshDNSRecordsPayload,
  IFreshDNSRecordsResponse,
} from '../domains/fresh_dns_records/freshDNSRecords.types';
import { fetchFreshDNSRecords } from '../_services/freshDNSRecords';

export async function POST(request: Request) {
  const parsedResult = await parseAndValidate<IFreshDNSRecordsPayload>(
    request,
    freshDNSRecordsPayloadValidate
  );

  if ('error' in parsedResult) {
    return parsedResult.error;
  }

  const parsed = parsedResult.data;

  if (!process.env.BILLION_MAIL_API || !process.env.BILLION_MAIL_TOKEN) {
    return NextResponse.json(
      {
        success: false,
        msg: 'Почтовый API не настроен',
        error: 'dns_records_refresh_failed',
      },
      { status: 500 }
    );
  }

  try {
    const dnsResponse = await fetchFreshDNSRecords(parsed);
    const body = dnsResponse.data;

    if (!body?.success) {
      return NextResponse.json(
        {
          success: false,
          msg: 'Не удалось обновить DNS-записи',
          error: 'dns_records_refresh_failed',
        },
        { status: 500 }
      );
    }

    const response: IFreshDNSRecordsResponse = {
      success: true,
      msg: 'Успешно',
      data: body.data,
    };

    return NextResponse.json<IFreshDNSRecordsResponse>(response);
  } catch (error) {
    if (error instanceof AxiosError) {
      return NextResponse.json(
        {
          success: false,
          msg: 'Не удалось обновить DNS-записи',
          error: 'dns_records_refresh_failed',
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        msg: 'Не удалось обновить DNS-записи',
        error: 'dns_records_refresh_failed',
      },
      { status: 500 }
    );
  }
}

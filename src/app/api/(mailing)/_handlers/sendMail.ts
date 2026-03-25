import { AxiosError } from 'axios';
import { NextResponse } from 'next/server';

import { sendMail } from '../_services/sendMail';
import { sendMailPayloadValidate } from '../mailing/sendMail/sendMail.validation';
import { ISendMailPayload, ISendMailResponse } from '../mailing/sendMail/sendMail.types';

const buildErrorResponse = (msg?: string) =>
  NextResponse.json<ISendMailResponse>({ msg, success: false }, { status: 500 });

export async function POST(request: Request) {
  const payload: ISendMailPayload = await request.json();

  await sendMailPayloadValidate.validate(payload, { abortEarly: false });

  return sendMail(payload)
    .then((response) => {
      const body = response.data;

      if (!body.success) {
        return buildErrorResponse(body.msg);
      }

      return NextResponse.json<ISendMailResponse>({ msg: body.msg, success: body.success });
    })
    .catch((error) => {
      if (error instanceof AxiosError) {
        return buildErrorResponse(error.response?.data.error);
      }

      return buildErrorResponse('An unhandled error');
    });
}

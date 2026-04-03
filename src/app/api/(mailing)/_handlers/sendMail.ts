import { AxiosError } from 'axios';
import { NextResponse } from 'next/server';

import { sendMail } from '../_services/sendMail';
import { sendMailPayloadValidate } from '../mailing/sendMail/sendMail.validation';
import { ISendMailPayload, ISendMailResponse } from '../mailing/sendMail/sendMail.types';

const buildErrorResponse = (msg?: string) =>
  NextResponse.json<ISendMailResponse>(
    { msg: msg ?? 'Не удалось отправить письмо', success: false },
    { status: 500 }
  );

export async function POST(request: Request) {
  const payload: ISendMailPayload = await request.json();

  await sendMailPayloadValidate.validate(payload, { abortEarly: false });

  return sendMail(payload)
    .then((response) => {
      const body = response.data;

      if (!body.success) {
        return buildErrorResponse();
      }

      return NextResponse.json<ISendMailResponse>({ msg: 'Успешно', success: body.success });
    })
    .catch((error) => {
      if (error instanceof AxiosError) {
        return buildErrorResponse();
      }

      return buildErrorResponse('Необработанная ошибка');
    });
}

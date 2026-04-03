import { AxiosError } from 'axios';
import { NextResponse } from 'next/server';
import { render } from '@react-email/render';

import { SignUpOtpEmail } from '@/entities/session';
import { parseAndValidate } from '@/app/api/_utils/request';

import { sendSignUpOtp } from '../_services/sendSignUpOtp';
import { ISendOTPSignUpPayload, ISendOTPSignUpResponse } from '../sign-up/otp/sendOTPSignUp.types';
import { sendOTPSignUpPayloadValidate } from '../sign-up/otp/sendOTPSignUp.validation';
import { sendMail } from '../../(mailing)/_services/sendMail';
import { ISendMailPayload } from '../../(mailing)/mailing/sendMail/sendMail.types';

const sendOtpEmail = async (payload: ISendMailPayload) => {
  try {
    const mailResponse = await sendMail(payload);
    const mailBody = mailResponse.data;

    if (!mailBody?.success) {
      return NextResponse.json<ISendOTPSignUpResponse>(
        {
          success: false,
          msg: 'Не удалось отправить код подтверждения',
          error: 'mail_failed',
        },
        { status: 500 }
      );
    }
  } catch (error) {
    if (error instanceof AxiosError) {
      return NextResponse.json<ISendOTPSignUpResponse>(
        {
          success: false,
          msg: 'Не удалось отправить код подтверждения',
          error: 'mail_failed',
        },
        { status: 500 }
      );
    }

    return NextResponse.json<ISendOTPSignUpResponse>(
      { success: false, msg: 'Не удалось отправить код подтверждения', error: 'mail_failed' },
      { status: 500 }
    );
  }

  return null;
};

export async function POST(request: Request) {
  const parsedResult = await parseAndValidate<ISendOTPSignUpPayload>(
    request,
    sendOTPSignUpPayloadValidate
  );

  if ('error' in parsedResult) {
    return parsedResult.error;
  }

  const parsed = parsedResult.data;

  try {
    const result = await sendSignUpOtp(parsed.email);

    if (result.status === 'account_exists') {
      const response: ISendOTPSignUpResponse = {
        success: false,
        msg: 'Аккаунт с таким адресом электронной почты уже существует',
        error: 'account_exists',
      };

      return NextResponse.json<ISendOTPSignUpResponse>(response, { status: 409 });
    }

    const mailPayload: ISendMailPayload = {
      recipient: parsed.email,
      attribs: {
        html: await render(SignUpOtpEmail({ otpCode: result.otpCode })),
      },
    };

    const mailError = await sendOtpEmail(mailPayload);
    if (mailError) {
      return mailError;
    }

    const response: ISendOTPSignUpResponse = {
      success: true,
      msg: 'Успешно',
      data: { otp_guid: result.otpGuid, expires_at: result.expiresAt },
    };

    return NextResponse.json<ISendOTPSignUpResponse>(response);
  } catch {
    return NextResponse.json<ISendOTPSignUpResponse>(
      { success: false, msg: 'Не удалось создать код подтверждения' },
      { status: 500 }
    );
  }
}

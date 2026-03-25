import { AxiosError } from 'axios';
import { NextResponse } from 'next/server';
import { render } from '@react-email/render';

import { CreateDomainOtpEmail } from '@/entities/domain/ui/CreateDomainOTPEmail/CreateDomainOTPEmail';
import { parseAndValidate } from '@/app/api/_utils/request';

import {
  ISendOTPCreateDomainPayload,
  ISendOTPCreateDomainResponse,
} from '../domains/create/otp/sendOTPCreateDomain.types';
import { sendOTPCreateDomainPayloadValidate } from '../domains/create/otp/sendOTPCreateDomain.validation';
import { sendDomainOtp } from '../_services/sendDomainOtp';
import { sendMail } from '../../(mailing)/_services/sendMail';
import { ISendMailPayload } from '../../(mailing)/mailing/sendMail/sendMail.types';

const sendOtpEmail = async (payload: ISendMailPayload) => {
  try {
    const mailResponse = await sendMail(payload);
    const mailBody = mailResponse.data;

    if (!mailBody?.success) {
      return NextResponse.json(
        {
          success: false,
          msg: mailBody?.msg ?? 'Failed to send OTP email',
          error: 'mail_failed',
        },
        { status: 500 }
      );
    }
  } catch (error) {
    if (error instanceof AxiosError) {
      return NextResponse.json(
        {
          success: false,
          msg: error.response?.data?.error ?? 'Failed to send OTP email',
          error: 'mail_failed',
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: false, msg: 'Failed to send OTP email', error: 'mail_failed' },
      { status: 500 }
    );
  }

  return null;
};

export async function POST(request: Request) {
  const parsedResult = await parseAndValidate<ISendOTPCreateDomainPayload>(
    request,
    sendOTPCreateDomainPayloadValidate
  );

  if ('error' in parsedResult) {
    return parsedResult.error;
  }

  const parsed = parsedResult.data;

  try {
    const result = await sendDomainOtp(parsed.email);

    const mailPayload: ISendMailPayload = {
      recipient: parsed.email,
      attribs: {
        html: await render(CreateDomainOtpEmail({ email: parsed.email, otpCode: result.otpCode })),
      },
    };

    const mailError = await sendOtpEmail(mailPayload);
    if (mailError) {
      return mailError;
    }

    const response: ISendOTPCreateDomainResponse = {
      otp_guid: result.otpGuid,
      expires_at: result.expiresAt,
    };

    return NextResponse.json<ISendOTPCreateDomainResponse>(response);
  } catch {
    return NextResponse.json({ success: false, msg: 'Failed to create OTP' }, { status: 500 });
  }
}

import { AxiosError } from 'axios';
import { NextResponse } from 'next/server';
import { render } from '@react-email/render';

import { auth } from '@/auth';
import { getDataSource } from '@/database/data-source';
import { CreateDomainOtpEmail } from '@/entities/domain/ui/CreateDomainOTPEmail/CreateDomainOTPEmail';
import { parseAndValidate } from '@/app/api/_utils/request';

import {
  ISendOTPCreateMailboxPayload,
  ISendOTPCreateMailboxResponse,
} from '../mailbox/create/otp/sendOTPCreateMailbox.types';
import { sendOTPCreateMailboxPayloadValidate } from '../mailbox/create/otp/sendOTPCreateMailbox.validation';
import { sendMailboxOtp } from '../_services/sendMailboxOtp';
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
          msg: 'Не удалось отправить код подтверждения',
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
          msg: 'Не удалось отправить код подтверждения',
          error: 'mail_failed',
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: false, msg: 'Не удалось отправить код подтверждения', error: 'mail_failed' },
      { status: 500 }
    );
  }

  return null;
};

export async function POST(request: Request) {
  const parsedResult = await parseAndValidate<ISendOTPCreateMailboxPayload>(
    request,
    sendOTPCreateMailboxPayloadValidate
  );

  if ('error' in parsedResult) {
    return parsedResult.error;
  }

  const parsed = parsedResult.data;

  const session = await auth();
  const accountId = session?.user?.id;
  if (!accountId) {
    return NextResponse.json({ success: false, msg: 'Требуется авторизация' }, { status: 401 });
  }

  if (parsed.local_part.includes('@')) {
    return NextResponse.json(
      { success: false, msg: 'Некорректная часть адреса до символа @' },
      { status: 400 }
    );
  }

  const normalizedDomain = parsed.domain.toLowerCase();

  try {
    const dataSource = await getDataSource();
    const rows = await dataSource.query(
      'SELECT 1 FROM account_domain WHERE account_id = $1 AND domain = $2 LIMIT 1',
      [accountId, normalizedDomain]
    );

    if ((rows as Array<unknown>).length === 0) {
      return NextResponse.json(
        { success: false, msg: 'Домен недоступен', error: 'domain_access_denied' },
        { status: 403 }
      );
    }
  } catch {
    return NextResponse.json(
      { success: false, msg: 'Не удалось проверить доступ к домену', error: 'domain_access_failed' },
      { status: 500 }
    );
  }

  const email = `${parsed.local_part}@${normalizedDomain}`;

  try {
    const result = await sendMailboxOtp(email);

    const mailPayload: ISendMailPayload = {
      recipient: email,
      attribs: {
        html: await render(CreateDomainOtpEmail({ email, otpCode: result.otpCode })),
      },
    };

    const mailError = await sendOtpEmail(mailPayload);
    if (mailError) {
      return mailError;
    }

    const response: ISendOTPCreateMailboxResponse = {
      otp_guid: result.otpGuid,
      expires_at: result.expiresAt,
    };

    return NextResponse.json<ISendOTPCreateMailboxResponse>(response);
  } catch {
    return NextResponse.json(
      { success: false, msg: 'Не удалось создать код подтверждения' },
      { status: 500 }
    );
  }
}

import { randomBytes } from 'crypto';
import { AxiosError } from 'axios';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getDataSource } from '@/database/data-source';
import { parseAndValidate } from '@/app/api/_utils/request';
import { OTPCreateDomainPayloadValidate } from '../domains/create/OTPCreateDomain.validation';
import {
  IOTPCreateDomainPayload,
  IOTPCreateDomainResponse,
} from '../domains/create/OTPCreateDomain.types';
import { createDomain } from '../_services/createDomain';
import { createMailbox } from '../_services/createMailbox';
import { deleteMailboxes } from '../_services/deleteMailboxes';
import { fetchDomainMailboxes } from '../_services/listMailboxes';
import { verifyDomainOtp } from '../_services/verifyDomainOtp';

export async function POST(request: Request) {
  const parsedResult = await parseAndValidate<IOTPCreateDomainPayload>(
    request,
    OTPCreateDomainPayloadValidate
  );

  if ('error' in parsedResult) {
    return parsedResult.error;
  }

  const parsed = parsedResult.data;

  const session = await auth();
  const accountId = session?.user?.id;
  if (!accountId) {
    return NextResponse.json({ success: false, msg: 'Unauthorized' }, { status: 401 });
  }

  if (parsed.local_part.includes('@')) {
    return NextResponse.json({ success: false, msg: 'Invalid local part' }, { status: 400 });
  }

  const email = `${parsed.local_part}@${parsed.domain}`;
  const normalizedDomain = parsed.domain.toLowerCase();
  const mailboxUsername = `${parsed.local_part}@${normalizedDomain}`;

  let otpResult: Awaited<ReturnType<typeof verifyDomainOtp>>;
  try {
    otpResult = await verifyDomainOtp({
      otpGuid: parsed.otp_guid,
      email,
      otpCode: parsed.otp,
    });
  } catch {
    return NextResponse.json(
      { success: false, msg: 'Failed to verify OTP' },
      { status: 500 }
    );
  }

  if (otpResult.status === 'otp_not_found') {
    return NextResponse.json({ success: false, msg: 'OTP not found' }, { status: 404 });
  }

  if (!process.env.BILLION_MAIL_API || !process.env.BILLION_MAIL_TOKEN) {
    return NextResponse.json(
      { success: false, msg: 'Mail API is not configured', error: 'domain_create_failed' },
      { status: 500 }
    );
  }

  try {
    const domainResponse = await createDomain({
      domain: parsed.domain,
      email,
      quota: 10 * 1024 * 1024,
    });
    const domainBody = domainResponse.data;

    if (domainBody?.success === false) {
      return NextResponse.json(
        {
          success: false,
          msg: domainBody?.msg ?? 'Failed to create domain',
          error: domainBody?.error ?? 'domain_create_failed',
        },
        { status: 500 }
      );
    }

    try {
      const dataSource = await getDataSource();
      await dataSource.query(
        `INSERT INTO account_domain (account_id, domain)
         VALUES ($1, $2)
         ON CONFLICT DO NOTHING`,
        [accountId, normalizedDomain]
      );
    } catch {
      return NextResponse.json(
        {
          success: false,
          msg: 'Failed to save domain',
          error: 'account_domain_create_failed',
        },
        { status: 500 }
      );
    }
  } catch (error) {
    if (error instanceof AxiosError) {
      return NextResponse.json(
        {
          success: false,
          msg:
            error.response?.data?.error ??
            error.response?.data?.msg ??
            'Failed to create domain',
          error: 'domain_create_failed',
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: false, msg: 'Failed to create domain', error: 'domain_create_failed' },
      { status: 500 }
    );
  }

  let mailboxEmails: string[] = [];

  try {
    const listResponse = await fetchDomainMailboxes(parsed.domain);
    const listBody = listResponse.data;

    if (!listBody?.success) {
      return NextResponse.json(
        {
          success: false,
          msg: listBody?.msg ?? 'Failed to fetch mailboxes',
          error: listBody?.error ?? 'mailbox_list_failed',
        },
        { status: 500 }
      );
    }

    mailboxEmails = (listBody.data ?? [])
      .map((mailbox) => mailbox.username)
      .filter((value): value is string => Boolean(value));
  } catch (error) {
    if (error instanceof AxiosError) {
      return NextResponse.json(
        {
          success: false,
          msg:
            error.response?.data?.error ??
            error.response?.data?.msg ??
            'Failed to fetch mailboxes',
          error: 'mailbox_list_failed',
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: false, msg: 'Failed to fetch mailboxes', error: 'mailbox_list_failed' },
      { status: 500 }
    );
  }

  if (mailboxEmails.length > 0) {
    try {
      const deleteResponse = await deleteMailboxes(mailboxEmails);
      const deleteBody = deleteResponse.data;

      if (!deleteBody?.success) {
        return NextResponse.json(
          {
            success: false,
            msg: deleteBody?.msg ?? 'Failed to delete mailboxes',
            error: deleteBody?.error ?? 'mailbox_delete_failed',
          },
          { status: 500 }
        );
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        return NextResponse.json(
          {
            success: false,
            msg:
              error.response?.data?.error ??
              error.response?.data?.msg ??
              'Failed to delete mailboxes',
            error: 'mailbox_delete_failed',
          },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { success: false, msg: 'Failed to delete mailboxes', error: 'mailbox_delete_failed' },
        { status: 500 }
      );
    }
  }

  const password = randomBytes(16).toString('hex');

  try {
    const mailboxResponse = await createMailbox({
      domain: parsed.domain,
      local_part: parsed.local_part,
      password,
      isAdmin: 0,
      active: 1,
    });
    const mailboxBody = mailboxResponse.data;

    if (mailboxBody?.success === false) {
      return NextResponse.json(
        {
          success: false,
          msg: mailboxBody?.msg ?? 'Failed to create mailbox',
          error: mailboxBody?.error ?? 'mailbox_create_failed',
        },
        { status: 500 }
      );
    }

    try {
      const dataSource = await getDataSource();
      await dataSource.query(
        `INSERT INTO account_mailbox (account_id, username, domain, local_part)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (username) DO NOTHING`,
        [accountId, mailboxUsername, normalizedDomain, parsed.local_part]
      );
    } catch {
      return NextResponse.json(
        {
          success: false,
          msg: 'Failed to save mailbox',
          error: 'account_mailbox_create_failed',
        },
        { status: 500 }
      );
    }
  } catch (error) {
    if (error instanceof AxiosError) {
      return NextResponse.json(
        {
          success: false,
          msg:
            error.response?.data?.error ??
            error.response?.data?.msg ??
            'Failed to create mailbox',
          error: 'mailbox_create_failed',
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: false, msg: 'Failed to create mailbox', error: 'mailbox_create_failed' },
      { status: 500 }
    );
  }

  const response: IOTPCreateDomainResponse = {
    otp_guid: parsed.otp_guid,
    expires_at: Date.now() + 5 * 60 * 1000,
  };

  return NextResponse.json<IOTPCreateDomainResponse>(response);
}

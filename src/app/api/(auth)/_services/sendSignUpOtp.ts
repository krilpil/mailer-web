import { randomInt } from 'crypto';

import { getDataSource } from '@/database/data-source';
import { findAccountByEmail } from '@/app/api/(auth)/_repositories/accountRepo';
import { createOtp } from '@/app/api/(auth)/_repositories/otpRepo';

const OTP_LENGTH = 6;
const OTP_MAX = 10 ** OTP_LENGTH;

const generateOtp = () => String(randomInt(0, OTP_MAX)).padStart(OTP_LENGTH, '0');

export type SendSignUpOtpResult =
  | { status: 'ok'; otpGuid: string; expiresAt: number; otpCode: string }
  | { status: 'account_exists' };

export const sendSignUpOtp = async (email: string): Promise<SendSignUpOtpResult> => {
  const dataSource = await getDataSource();
  const existing = await findAccountByEmail(dataSource.manager, email);

  if (existing) {
    return { status: 'account_exists' };
  }

  const otpCode = generateOtp();
  const { id, expiresAt } = await dataSource.transaction((manager) =>
    createOtp(manager, email, otpCode)
  );

  return { status: 'ok', otpGuid: id, expiresAt, otpCode };
};

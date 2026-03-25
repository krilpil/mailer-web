import bcrypt from 'bcryptjs';

import { getDataSource } from '@/database/data-source';

import { createAccount } from '../_repositories/accountRepo';
import { consumeOtp } from '../_repositories/otpRepo';

export type VerifySignUpOtpResult = { status: 'ok'; userId: string } | { status: 'otp_not_found' };

type VerifySignUpOtpParams = {
  otpGuid: string;
  email: string;
  otpCode: string;
  password: string;
};

export const verifySignUpOtp = async ({
  otpGuid,
  email,
  otpCode,
  password,
}: VerifySignUpOtpParams): Promise<VerifySignUpOtpResult> => {
  const dataSource = await getDataSource();

  return dataSource.transaction(async (manager) => {
    const consumed = await consumeOtp(manager, otpGuid, email, otpCode);
    if (!consumed) return { status: 'otp_not_found' as const };

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = await createAccount(manager, email, passwordHash);

    return { status: 'ok' as const, userId };
  });
};

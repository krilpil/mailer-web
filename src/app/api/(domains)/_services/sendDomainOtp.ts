import { randomInt } from 'crypto';

import { getDataSource } from '@/database/data-source';
import { createOtp } from '@/app/api/(auth)/_repositories/otpRepo';

const OTP_LENGTH = 6;
const OTP_MAX = 10 ** OTP_LENGTH;

const generateOtp = () => String(randomInt(0, OTP_MAX)).padStart(OTP_LENGTH, '0');

export type SendDomainOtpResult = {
  otpGuid: string;
  expiresAt: number;
  otpCode: string;
};

export const sendDomainOtp = async (email: string): Promise<SendDomainOtpResult> => {
  const dataSource = await getDataSource();
  const otpCode = generateOtp();
  const { id, expiresAt } = await dataSource.transaction((manager) =>
    createOtp(manager, email, otpCode)
  );

  return { otpGuid: id, expiresAt, otpCode };
};

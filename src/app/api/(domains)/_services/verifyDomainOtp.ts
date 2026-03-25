import { getDataSource } from '@/database/data-source';
import { consumeOtpByGuid, findActiveOtp } from '@/app/api/(auth)/_repositories/otpRepo';

export type VerifyDomainOtpResult = { status: 'ok' } | { status: 'otp_not_found' };

const OTP_LENGTH = 6;

type VerifyDomainOtpParams = {
  otpGuid: string;
  email: string;
  otpCode: string;
};

export const verifyDomainOtp = async ({
  otpGuid,
  email,
  otpCode,
}: VerifyDomainOtpParams): Promise<VerifyDomainOtpResult> => {
  const dataSource = await getDataSource();

  return dataSource.transaction(async (manager) => {
    const activeOtp = await findActiveOtp(manager, otpGuid, email);
    if (!activeOtp) return { status: 'otp_not_found' as const };

    const normalizedOtp = String(activeOtp.otp_code).padStart(OTP_LENGTH, '0');
    if (normalizedOtp !== otpCode) return { status: 'otp_not_found' as const };

    const consumed = await consumeOtpByGuid(manager, otpGuid, email);
    if (!consumed) return { status: 'otp_not_found' as const };

    return { status: 'ok' as const };
  });
};

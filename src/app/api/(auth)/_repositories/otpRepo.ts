import { EntityManager } from 'typeorm';

type CreateOtpResult = {
  id: string;
  expiresAt: number;
};

type ActiveOtpRow = {
  otp_code: string | number;
  expires_at: string | Date;
};

export const createOtp = async (
  manager: EntityManager,
  email: string,
  otpCode: string
): Promise<CreateOtpResult> => {
  await manager.query('UPDATE otp SET used_at = now() WHERE email = $1 AND used_at IS NULL', [
    email,
  ]);

  const rows = await manager.query(
    'INSERT INTO otp (email, otp_code) VALUES ($1, $2) RETURNING id, expires_at',
    [email, otpCode]
  );

  const row = rows[0] as { id?: string; expires_at?: string | Date } | undefined;

  if (!row?.id || !row?.expires_at) {
    throw new Error('OTP insert failed');
  }

  const expiresAtDate = row.expires_at instanceof Date ? row.expires_at : new Date(row.expires_at);
  const expiresAt = Math.floor(expiresAtDate.getTime() / 1000);

  return { id: row.id, expiresAt };
};

export const findActiveOtp = async (manager: EntityManager, otpGuid: string, email: string) => {
  const rows = await manager.query(
    `SELECT otp_code, expires_at
     FROM otp
     WHERE id = $1
       AND email = $2
       AND used_at IS NULL
       AND expires_at > now()`,
    [otpGuid, email]
  );

  return (rows[0] as ActiveOtpRow | undefined) ?? null;
};

export const consumeOtpByGuid = async (
  manager: EntityManager,
  otpGuid: string,
  email: string
) => {
  const rows = await manager.query(
    `DELETE FROM otp
      WHERE id = $1
        AND email = $2
        AND used_at IS NULL
        AND expires_at > now()
      RETURNING id`,
    [otpGuid, email]
  );

  return rows.length > 0;
};

export const consumeOtp = async (
  manager: EntityManager,
  otpGuid: string,
  email: string,
  otpCode: string
) => {
  const rows = await manager.query(
    `DELETE FROM otp
      WHERE id = $1
        AND email = $2
        AND otp_code = $3
        AND used_at IS NULL
        AND expires_at > now()
      RETURNING id`,
    [otpGuid, email, otpCode]
  );

  return rows.length > 0;
};

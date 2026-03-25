import { NextResponse } from 'next/server';
import { encode } from 'next-auth/jwt';
import { parseAndValidate } from '@/app/api/_utils/request';
import { verifySignUpOtp } from '../_services/verifySignUpOtp';
import { IVerifyOTPSignUpPayload, IVerifyOTPSignUpResponse } from '../sign-up/signUp.types';
import { verifyOTPSignUpPayloadValidate } from '../sign-up/signUp.validation';

const SESSION_MAX_AGE = 60 * 60 * 24 * 7;
const SESSION_COOKIE_NAME = 'authjs.session-token';
const SECURE_SESSION_COOKIE_NAME = '__Secure-authjs.session-token';

const getAuthSecret = () => process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET ?? '';

const buildSessionToken = async (userId: string, email: string, salt: string) => {
  const secret = getAuthSecret();
  if (!secret) return null;

  return encode({
    token: {
      sub: userId,
      userId,
      email,
    },
    salt,
    secret,
    maxAge: SESSION_MAX_AGE,
  });
};

const attachSessionCookies = (response: NextResponse, token: string, secureToken: string) => {
  const cookieBase = `Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_MAX_AGE}`;
  response.headers.append('Set-Cookie', `${SESSION_COOKIE_NAME}=${token}; ${cookieBase}`);
  response.headers.append(
    'Set-Cookie',
    `${SECURE_SESSION_COOKIE_NAME}=${secureToken}; ${cookieBase}; Secure`
  );
};

export async function POST(request: Request) {
  const parsedResult = await parseAndValidate<IVerifyOTPSignUpPayload>(
    request,
    verifyOTPSignUpPayloadValidate
  );

  if ('error' in parsedResult) {
    return parsedResult.error;
  }

  const parsed = parsedResult.data;

  try {
    const result = await verifySignUpOtp({
      otpGuid: parsed.otp_guid,
      email: parsed.email,
      otpCode: parsed.otp_code,
      password: parsed.password,
    });

    if (result.status === 'otp_not_found') {
      return NextResponse.json<IVerifyOTPSignUpResponse>(
        { success: false, msg: 'OTP not found' },
        { status: 404 }
      );
    }

    const secret = getAuthSecret();
    if (!secret) {
      return NextResponse.json<IVerifyOTPSignUpResponse>(
        { success: false, msg: 'Auth secret is not configured' },
        { status: 500 }
      );
    }

    const response: IVerifyOTPSignUpResponse = { success: true, msg: 'OK' };
    const nextResponse = NextResponse.json<IVerifyOTPSignUpResponse>(response);
    const token = await buildSessionToken(result.userId, parsed.email, SESSION_COOKIE_NAME);
    const secureToken = await buildSessionToken(
      result.userId,
      parsed.email,
      SECURE_SESSION_COOKIE_NAME
    );

    if (token && secureToken) {
      attachSessionCookies(nextResponse, token, secureToken);
    }

    return nextResponse;
  } catch {
    return NextResponse.json<IVerifyOTPSignUpResponse>(
      { success: false, msg: 'Failed to verify OTP' },
      { status: 500 }
    );
  }
}

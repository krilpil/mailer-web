import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { auth } from '@/auth';
import { SignInPage } from '@/screens/SignInPage';

export const metadata: Metadata = {
  title: 'Вход',
};

export default async function Login() {
  const session = await auth();

  if (session?.user) redirect('/');

  return <SignInPage />;
}

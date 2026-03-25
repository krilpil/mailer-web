'use server';

import { redirect } from 'next/navigation';

import { auth } from '@/auth';
import { SignUpPage } from '@/screens/SignUpPage';

export default async function Register() {
  const session = await auth();

  if (session?.user) redirect('/');

  return <SignUpPage />;
}

'use server';

import { PropsWithChildren } from 'react';

import { PrivateLayout } from '@/screens/PrivateLayout';

export default async function Layout({ children }: PropsWithChildren) {
  return <PrivateLayout>{children}</PrivateLayout>;
}

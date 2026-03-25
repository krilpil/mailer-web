import React, { PropsWithChildren } from 'react';
import type { Metadata } from 'next';
import { Roboto } from 'next/font/google';
import dotenv from 'dotenv';

import { WithProviders } from '@/app/(providers)';

dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

const roboto = Roboto({
  weight: ['400', '500', '700'],
  subsets: ['latin', 'cyrillic'],
  variable: '--font-roboto',
});

export const metadata: Metadata = {
  title: 'title',
  description: 'description',
  robots: {
    index: true,
    notranslate: true,
  },
  // icons: {
  //   icon: [
  //     {
  //       media: '(prefers-color-scheme: light)',
  //       url: '/favicon-light.ico',
  //       href: '/favicon-light.ico',
  //     },
  //     {
  //       media: '(prefers-color-scheme: dark)',
  //       url: '/favicon-dark.ico',
  //       href: '/favicon-dark.ico',
  //     },
  //   ],
  // },
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="ru">
      <body className={`${roboto.variable} font-sans`}>
        <WithProviders>{children}</WithProviders>
      </body>
    </html>
  );
}

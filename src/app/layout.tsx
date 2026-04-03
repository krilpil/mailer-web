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
  title: {
    default: 'Mailfinch',
    template: '%s | Mailfinch',
  },
  description: 'Панель управления почтовым сервисом Mailfinch',
  robots: {
    index: true,
    notranslate: true,
  },
  icons: {
    icon: [
      {
        url: '/favicon.png',
        href: '/favicon.png',
      },
    ],
  },
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

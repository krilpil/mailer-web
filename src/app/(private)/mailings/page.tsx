import type { Metadata } from 'next';
import { MailingsPage } from '@/screens/MailingsPage';

export const metadata: Metadata = {
  title: 'Рассылки',
};

export default async function Mailings() {
  return <MailingsPage />;
}

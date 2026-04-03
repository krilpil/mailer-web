import type { Metadata } from 'next';
import { MailingPage } from '@/screens/MailingPage';

export const metadata: Metadata = {
  title: 'Новый шаблон',
};

export default async function Mailing() {
  return <MailingPage />;
}

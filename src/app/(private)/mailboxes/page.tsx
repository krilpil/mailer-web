import type { Metadata } from 'next';
import { MailboxesPage } from '@/screens/MailboxesPage';

export const metadata: Metadata = {
  title: 'Почтовые ящики',
};

export default async function Mailboxes() {
  return <MailboxesPage />;
}

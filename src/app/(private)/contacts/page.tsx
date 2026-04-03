import type { Metadata } from 'next';
import { ContactsPage } from '@/screens/ContactsPage';

export const metadata: Metadata = {
  title: 'Контакты',
};

export default async function Contacts() {
  return <ContactsPage />;
}

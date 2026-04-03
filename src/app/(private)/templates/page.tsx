import type { Metadata } from 'next';
import { TemplatesPage } from '@/screens/TemplatesPage';

export const metadata: Metadata = {
  title: 'Список шаблонов',
};

export default async function Templates() {
  return <TemplatesPage />;
}

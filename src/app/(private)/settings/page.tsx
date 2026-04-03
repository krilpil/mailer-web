import type { Metadata } from 'next';
import { SettingsPage } from '@/screens/SettingsPage';

export const metadata: Metadata = {
  title: 'Настройки',
};

export default async function Settings() {
  return <SettingsPage />;
}

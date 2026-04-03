import type { Metadata } from 'next';

import { AnalyticsPage } from '@/screens/AnalyticsPage';

export const metadata: Metadata = {
  title: 'Аналитика',
};

export default async function Home() {
  return <AnalyticsPage />;
}

'use server';

import { QueryClient } from '@tanstack/react-query';

import { getQueryClientConfig } from '@/shared/config';

export const getQueryServer = async () => {
  const queryClientConfig = getQueryClientConfig({ isServer: true, userGUID: 'userGUID' });

  return new QueryClient(queryClientConfig);
};

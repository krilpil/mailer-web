'use client';

import { QueryClient } from '@tanstack/react-query';

import { getQueryClientConfig } from '@/shared/config';

export const getQueryClient = () => {
  const queryClientConfig = getQueryClientConfig({ isServer: false, userGUID: 'userGUID' });

  return new QueryClient(queryClientConfig);
};

export const queryClient = getQueryClient();

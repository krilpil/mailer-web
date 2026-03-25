import { QueryClientConfig } from '@tanstack/query-core';

interface IQueryClientOptions {
  isServer: boolean;
  userGUID?: string;
}

export const getQueryClientConfig = ({
  isServer,
  userGUID = '',
}: IQueryClientOptions): QueryClientConfig => {
  const cacheTime = isServer ? 0 : 60_000 * 5;

  return {
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        staleTime: cacheTime,
        gcTime: cacheTime,
        retry: isServer ? 0 : 1,
        refetchOnMount: false,
        queryKeyHashFn: (queryKey) => {
          const keyHash = [...queryKey, userGUID];
          return JSON.stringify(keyHash);
        },
      },
    },
  };
};

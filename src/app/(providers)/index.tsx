import { FC, PropsWithChildren } from 'react';

import { AntDesignProvider } from './AntdRegistryProvider';
import { AntDesignConfigProvider } from './AntDesignConfigProvider';
import { StyledComponentsProvider } from './StyledComponentsProvider';
import { RQClientProvider } from './RQClientProvider';

export const WithProviders: FC<PropsWithChildren> = ({ children }) => (
  <AntDesignProvider>
    <AntDesignConfigProvider>
      <StyledComponentsProvider>
        <RQClientProvider>{children}</RQClientProvider>
      </StyledComponentsProvider>
    </AntDesignConfigProvider>
  </AntDesignProvider>
);

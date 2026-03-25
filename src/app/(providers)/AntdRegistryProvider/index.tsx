'use server';

import { PropsWithChildren } from 'react';
import { AntdRegistry } from '@ant-design/nextjs-registry';

export const AntDesignProvider = async ({ children }: PropsWithChildren) => (
  <AntdRegistry>{children}</AntdRegistry>
);

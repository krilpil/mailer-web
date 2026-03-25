'use client';

import { PropsWithChildren } from 'react';
import { ConfigProvider } from 'antd';
import ruRU from 'antd/locale/ru_RU';
import dayjs from 'dayjs';
import ru from 'dayjs/locale/ru';
import isToday from 'dayjs/plugin/isToday';
import isYesterday from 'dayjs/plugin/isYesterday';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

import { themeConfig } from './theme';

dayjs.locale(ru);
dayjs.extend(isToday);
dayjs.extend(isYesterday);
dayjs.extend(utc);
dayjs.extend(timezone);

export const AntDesignConfigProvider = ({ children }: PropsWithChildren) => (
  <ConfigProvider locale={ruRU} theme={themeConfig} componentSize={'large'}>
    {children}
  </ConfigProvider>
);

import 'reflect-metadata';

import { DataSource } from 'typeorm';

import { Account } from './entities/Account';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [Account],
  migrations: [`${__dirname}/migrations/*.{ts,js}`],
  synchronize: false,
});

let initPromise: Promise<DataSource> | null = null;

export const getDataSource = async () => {
  if (AppDataSource.isInitialized) return AppDataSource;
  if (!initPromise) initPromise = AppDataSource.initialize();
  return initPromise;
};

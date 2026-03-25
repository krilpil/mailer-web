import { EntityManager } from 'typeorm';

import { Account } from '@/database/entities/Account';

export const findAccountByEmail = async (manager: EntityManager, email: string) =>
  manager.getRepository(Account).findOneBy({ email });

export const createAccount = async (
  manager: EntityManager,
  email: string,
  passwordHash: string
) => {
  const repo = manager.getRepository(Account);
  const account = repo.create({ email, passwordHash });
  const saved = await repo.save(account);
  return saved.id;
};

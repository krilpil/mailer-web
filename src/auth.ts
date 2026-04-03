import NextAuth from 'next-auth';
import bcrypt from 'bcryptjs';
import Credentials from 'next-auth/providers/credentials';
import { object, string } from 'yup';

import { Account } from '@/database/entities/Account';
import { getDataSource } from '@/database/data-source';
import { routes } from '@/shared/config';

const credentialsSchema = object({
  email: string().email().required(),
  password: string().required(),
})
  .noUnknown()
  .required();

async function getUserByEmail(email: string) {
  const dataSource = await getDataSource();
  return dataSource.getRepository(Account).findOneBy({ email });
}

export const { handlers, auth } = NextAuth({
  secret: process.env.AUTH_SECRET,
  pages: { signIn: routes.AUTH_PAGE, signOut: routes.REGISTER_PAGE },
  session: { strategy: 'jwt' },
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Электронная почта', type: 'email' },
        password: { label: 'Пароль', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = await credentialsSchema.validate(credentials, {
          abortEarly: false,
          stripUnknown: true,
        });

        const user = await getUserByEmail(parsed.email);
        if (!user) return null;

        const ok = await bcrypt.compare(parsed.password, user.passwordHash);
        if (!ok) return null;

        return { id: user.id, email: user.email, name: user.email };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.userId = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user) session.user.id = token.userId;
      return session;
    },
  },
});

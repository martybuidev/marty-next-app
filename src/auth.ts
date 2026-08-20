import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Facebook from 'next-auth/providers/facebook';
import GitHub from 'next-auth/providers/github';
import Google from 'next-auth/providers/google';

import { loginSchema } from './modules/auth/schemas';
import {
  buildAuthToken,
  getRefreshToken,
  login,
  logout,
} from './modules/auth/services/auth.service';
import { AUTH_PROVIDER } from './modules/auth/types';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google,
    GitHub,
    Facebook,
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },

      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        const result = await login({
          provider: AUTH_PROVIDER.credentials,
          email: parsed.data.email,
          password: parsed.data.password,
        });

        if (!result) {
          return null
        }

        return buildAuthToken({}, result);
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      const isCredentialsLogin =
        account?.provider === AUTH_PROVIDER.credentials;
      if (isCredentialsLogin) {
        return { ...token, ...user };
      }

      const isOAuthLogin = account;
      if (isOAuthLogin) {
        const provider = account.provider as keyof typeof AUTH_PROVIDER;
        const validProvider = AUTH_PROVIDER[provider];

        if (!validProvider) {
          return token;
        }

        const oauthToken = account.id_token || account.access_token;
        const result = await login({
          provider: validProvider,
          token: oauthToken,
        });

        if (!result) {
          throw new Error('BackendAuthFailed');
        }

        return buildAuthToken(token, result);
      }

      const isValidToken = Date.now() < (token.expiresAt as number);
      if (isValidToken) {
        return token;
      }

      if (!token.refreshToken) {
        return { ...token, error: 'refreshTokenError' as const };
      }

      const newToken = await getRefreshToken(token.refreshToken as string);

      if (!newToken) {
        return { ...token, error: 'refreshTokenError' as const };
      }

      return buildAuthToken(token, newToken);
    },

    session({ session, token: { id, role, accessToken, expiresAt, error } }) {
      session.user.id = id as string;
      session.user.role = role as string;
      session.user.accessToken = accessToken as string;
      session.user.expiresAt = expiresAt as number;
      session.error = error as string | undefined;
      return session;
    },

    redirect({ url, baseUrl }) {
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      } else if (new URL(url).origin === baseUrl) {
        return url;
      }
      return baseUrl;
    },
  },
  events: {
    signOut(message) {
      if ('token' in message && message.token?.refreshToken) {
        logout(message.token.refreshToken);
      }
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
  },
});

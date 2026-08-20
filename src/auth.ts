import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Facebook from 'next-auth/providers/facebook';
import GitHub from 'next-auth/providers/github';
import Google from 'next-auth/providers/google';

import { loginSchema } from './modules/auth/schemas';
import {
  AUTH_PROVIDER,
  TAuthProvider,
  TAuthResponse,
} from './modules/auth/types';
import { buildAuthToken } from './modules/auth/utils';
import { serverEnv } from './shared/config/server.env';

const authFetchOptions = {
  method: 'POST',
  headers: { 'Content-type': 'application/json' },
  cache: 'no-store',
} as const;

async function fetching(url: string, payload: unknown) {
  const res = await fetch(`${serverEnv.apiBaseUrl}/auth/${url}`, {
    ...authFetchOptions,
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    return null;
  }

  const data = await res.json();
  return data.data as TAuthResponse;
}

async function login(payload: {
  provider: TAuthProvider;
  email?: string;
  password?: string;
  token?: string;
}) {
  return fetching('login', payload);
}

async function getRefreshToken(refreshToken: string) {
  return fetching('refresh', { refreshToken });
}

async function logout(refreshToken: string) {
  await fetch(`${serverEnv.apiBaseUrl}/auth/logout`, {
    body: JSON.stringify({ refreshToken }),
    ...authFetchOptions,
  });
}

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
          return null;
        }

        return buildAuthToken({}, result);
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      // First time login with credentials
      if (account?.provider === AUTH_PROVIDER.credentials) {
        return { ...token, ...user };
      }

      // First time login with OAuth
      if (account) {
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

      // Valid token exp
      if (Date.now() < (token.expiresAt as number)) {
        return token;
      }

      if (!token.refreshToken) {
        return { ...token, error: 'refreshTokenError' as const };
      }

      // Refresh new token
      const refreshed = await getRefreshToken(token.refreshToken as string);

      if (!refreshed) {
        return { ...token, error: 'refreshTokenError' as const };
      }

      return buildAuthToken(token, refreshed);
    },

    session({ session, token: { id, role, accessToken, expiresAt } }) {
      session.user.id = id as string;
      session.user.role = role as string;
      session.user.accessToken = accessToken as string;
      session.user.expiresAt = expiresAt as number;
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

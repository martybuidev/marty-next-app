import { decodeJwt } from 'jose';
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';

import { loginSchema, TAuthResponse } from './modules/auth/auth.schema';
import { serverEnv } from './shared/config/server.env';

const authFetchOptions = {
  method: 'POST',
  headers: { 'Content-type': 'application/json' },
  cache: 'no-store',
} as const;

async function login(email: string, password: string) {
  const res = await fetch(`${serverEnv.apiBaseUrl}/auth/login`, {
    body: JSON.stringify({ email, password }),
    ...authFetchOptions,
  });
  const body = await res.json();

  if (!res.ok) {
    return null;
  }

  return body.data as TAuthResponse;
}

async function refresh(refreshToKen: string) {
  const res = await fetch(`${serverEnv.apiBaseUrl}/auth/refresh`, {
    body: JSON.stringify({ refreshToKen }),
    ...authFetchOptions,
  });

  if (!res.ok) {
    return null;
  }

  const body = await res.json();
  return body.data as TAuthResponse;
}

async function logout(refreshToKen: string) {
  await fetch(`${serverEnv.apiBaseUrl}/auth/logout`, {
    body: JSON.stringify({ refreshToKen }),
    ...authFetchOptions,
  }).catch(() => {});
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google,
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

        const result = await login(parsed.data.email, parsed.data.password);
        if (!result) {
          return null;
        }

        const {
          user: { id, email, role },
          accessToken,
          refreshToKen,
        } = result;
        const expires = decodeJwt(accessToken).exp;

        return {
          id: String(id),
          email,
          role,
          accessToken,
          refreshToKen,
          expires,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.expires = (user.expires as number) * 1000;
      }

      if (Date.now() < (token.expires as number)) {
        return token;
      }

      const refreshed = await refresh(token.refreshToken as string);
      if (!refreshed) {
        return { ...token, error: 'RefreshTokenError' as const };
      }

      const { accessToken, refreshToKen } = refreshed;
      const expires = decodeJwt(accessToken).exp;

      return {
        ...token,
        accessToken,
        refreshToKen,
        expires,
      };
    },
    session({ session, token: { id, role, accessToken, expires } }) {
      session.user.id = id as string;
      session.user.role = role as string;
      session.user.accessToken = accessToken as string;
      session.user.expires = expires as number;
      return session;
    },
    redirect({ url, baseUrl }) {
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
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
  },
  session: {
    strategy: 'jwt',
  },
});

import { decodeJwt } from 'jose';
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';

import { loginSchema } from './modules/auth/auth.schema';
import { serverEnv } from './shared/config/server.env';

const authFetchOptions = {
  method: 'POST',
  headers: { 'Content-type': 'application/json' },
  cache: 'no-store',
} as const;

export type TAuthResponse = {
  accessToken: string;
  refreshToken: string;
  user: { id: number; email: string; role: string };
};

export enum EAuthProvider {
  CREDENTIAL = 'credential',
  GOOGLE = 'google',
}

async function login(payload: {
  provider: EAuthProvider;
  email?: string;
  password?: string;
  token?: string;
}) {
  
  const res = await fetch(`${serverEnv.apiBaseUrl}/auth/login`, {
    ...authFetchOptions,
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    return null;
  }

  const data = await res.json();  
  return data.data as TAuthResponse;
}

async function getRefreshToken(refreshToken: string) {
  const res = await fetch(`${serverEnv.apiBaseUrl}/auth/refresh`, {
    body: JSON.stringify({ refreshToken }),
    ...authFetchOptions,
  });

  if (!res.ok) {
    return null;
  }

  const body = await res.json();
  return body.data as TAuthResponse;
}

async function logout(refreshToken: string) {
  await fetch(`${serverEnv.apiBaseUrl}/auth/logout`, {
    body: JSON.stringify({ refreshToken }),
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

        const result = await login({
          provider: EAuthProvider.CREDENTIAL,
          email: parsed.data.email,
          password: parsed.data.password,
        });
        if (!result) {
          return null;
        }

        const {
          user: { id, email, role },
          accessToken,
          refreshToken,
        } = result;
        const expiresAt = decodeJwt(accessToken).exp;

        return {
          id: String(id),
          email,
          role,
          accessToken,
          refreshToken,
          expiresAt,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (account?.provider === EAuthProvider.GOOGLE && account.id_token) {
        const result = await login({
          provider: EAuthProvider.GOOGLE,
          token: account.id_token,
        });

        if (result) {
          token.id = String(result.user.id);
          token.role = result.user.role;
          token.accessToken = result.accessToken;
          token.refreshToken = result.refreshToken;
          token.expiresAt =
            (decodeJwt(result.accessToken).exp as number) * 1000;
          return token;
        }
      }

      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.expiresAt = (user.expiresAt as number) * 1000;
        return token;
      }

      if (Date.now() < (token.expiresAt as number)) {
        return token;
      }

      const refreshed = await getRefreshToken(token.refreshToken as string);
      if (!refreshed) {
        return { ...token, error: 'refreshTokenError' as const };
      }

      const { accessToken, refreshToken } = refreshed;
      const expiresAt = decodeJwt(accessToken).exp;

      return {
        ...token,
        accessToken,
        refreshToken,
        expiresAt,
      };
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
      }
      else if (new URL(url).origin === baseUrl) {
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
  },
  session: {
    strategy: 'jwt',
  },
});

import { decodeJwt } from 'jose';

import { serverEnv } from '@/shared/config/server.env';

import { TAuthProvider, TAuthResponse } from '../types';

const getExpMs = (token: string) =>
  ((decodeJwt(token).exp ?? 0) as number) * 1000;

const authFetchOptions = {
  method: 'POST',
  headers: { 'Content-type': 'application/json' },
  cache: 'no-store',
} as const;

export const buildAuthToken = <T extends object>(
  target: T,
  res: TAuthResponse,
) => ({
  ...target,
  id: String(res.user.id),
  role: res.user.role,
  email: res.user.email,
  accessToken: res.accessToken,
  refreshToken: res.refreshToken,
  expiresAt: getExpMs(res.accessToken),
});

async function fetching(url: string, payload: unknown) {
  try {
    const res = await fetch(`${serverEnv.apiBaseUrl}/auth/${url}`, {
      ...authFetchOptions,
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    return data.data as TAuthResponse;
  } catch {
    return null;
  }
}

export async function login(payload: {
  provider: TAuthProvider;
  email?: string;
  password?: string;
  token?: string;
}) {
  return fetching('login', payload);
}

export async function getRefreshToken(refreshToken: string) {
  return fetching('refresh', { refreshToken });
}

export async function logout(refreshToken: string) {
  return fetching('logout', { refreshToken });
}

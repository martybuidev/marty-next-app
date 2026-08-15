import 'server-only';

import { serverEnv } from '@/app/shared/env/server';
import { NEST_AUTH_ENDPOINTS } from '@/app/shared/http/constant';
import { TApiSuccess } from '@/app/shared/http/type';

import { TLoginInput } from './auth.schema';
import { TAuthTokens, TUserRole } from './types';

export type TAuthTokensWithUser = TAuthTokens & {
  user: {
    userId: number;
    email: string;
    role: TUserRole;
  };
};

async function request<T>(path: string, init: RequestInit): Promise<T> {
  const response = await fetch(`${serverEnv.apiBaseUrl}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${path} (${response.status})`);
  }

  const body = (await response.json()) as TApiSuccess<T>;
  return body.data;
}

export async function login(input: TLoginInput): Promise<TAuthTokensWithUser> {
  return request<TAuthTokensWithUser>(NEST_AUTH_ENDPOINTS.login, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function register() {}
export async function refresh() {}
export async function logout() {}

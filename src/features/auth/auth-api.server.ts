import 'server-only';

import { serverEnv } from '@/shared/config/server.env';
import { type TApiError, type TApiSuccess } from '@/shared/types';

import { NEST_AUTH_ENDPOINTS } from './constants';
import { type TLoginInput, type TRegisterInput } from './schemas/auth.schema';
import { type TAuthTokens, type TAuthUser } from './types';

export type TAuthTokensWithUser = TAuthTokens & {
  user: TAuthUser;
};

export class NestApiError extends Error {
  readonly statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.name = 'NestApiError';
    this.statusCode = statusCode;
  }
}

async function request<T>(path: string, init: RequestInit): Promise<T> {
  const response = await fetch(`${serverEnv.apiBaseUrl}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...init.headers,
    },
    cache: 'no-store',
  });

  const body = (await response.json().catch(() => null)) as
    TApiSuccess<T> | TApiError | null;

  if (!response.ok) {
    const message =
      body?.message ?? `API request failed: ${path} (${response.status})`;
    throw new NestApiError(
      response.status,
      Array.isArray(message) ? message.join(', ') : message,
    );
  }

  return (body as TApiSuccess<T>).data;
}

export async function login(input: TLoginInput): Promise<TAuthTokensWithUser> {
  return request<TAuthTokensWithUser>(NEST_AUTH_ENDPOINTS.login, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function register(
  input: TRegisterInput,
): Promise<TAuthTokensWithUser> {
  return request<TAuthTokensWithUser>(NEST_AUTH_ENDPOINTS.register, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function refresh(
  refreshToken: string,
): Promise<TAuthTokensWithUser> {
  return request<TAuthTokensWithUser>(NEST_AUTH_ENDPOINTS.refresh, {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  });
}

export async function logout(refreshToken: string): Promise<void> {
  await request<unknown>(NEST_AUTH_ENDPOINTS.logout, {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  });
}

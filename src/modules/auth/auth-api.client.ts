import 'client-only';

import { type TApiError, type TApiSuccess } from '@/shared/types';

import { BFF_AUTH_ENDPOINTS } from './constants/endpoints.constants';
import type { TLoginInput, TRegisterInput } from './schemas';
import type { TAuthSession } from './types';

export class BffApiError extends Error {
  readonly statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.name = 'BffApiError';
    this.statusCode = statusCode;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...init?.headers,
    },
    credentials: 'include',
    cache: 'no-store',
  });

  const body = (await response.json().catch(() => null)) as
    TApiSuccess<T> | TApiError | null;

  if (!response.ok) {
    const message =
      body?.message ?? `Request failed: ${path} (${response.status})`;
    throw new BffApiError(
      response.status,
      Array.isArray(message) ? message.join(', ') : message,
    );
  }

  return (body as TApiSuccess<T>).data;
}

export function bffLogin(input: TLoginInput): Promise<TAuthSession> {
  return request<TAuthSession>(BFF_AUTH_ENDPOINTS.login, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function bffRegister(input: TRegisterInput): Promise<TAuthSession> {
  return request<TAuthSession>(BFF_AUTH_ENDPOINTS.register, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function bffSession(): Promise<TAuthSession> {
  return request<TAuthSession>(BFF_AUTH_ENDPOINTS.session, {
    method: 'GET',
  });
}

export function bffLogout(): Promise<void> {
  return request<unknown>(BFF_AUTH_ENDPOINTS.logout, {
    method: 'POST',
    body: JSON.stringify({}),
  }).then(() => undefined);
}

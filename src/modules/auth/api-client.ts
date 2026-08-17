import 'client-only';

import type { AxiosError, InternalAxiosRequestConfig } from 'axios';

import { createApiClient } from '@/shared/lib/api';

import { bffSession } from './auth-api.client';
import type { TAuthSession } from './types';
import { tokenStore } from './utils/token-store';

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retried?: boolean;
}

let refreshPromise: Promise<TAuthSession | null> | null = null;

function refreshSession(): Promise<TAuthSession | null> {
  refreshPromise ??= bffSession()
    .then((session) => {
      tokenStore.set(session.accessToken);
      return session;
    })
    .catch(() => null)
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

export const apiClient = createApiClient();

apiClient.interceptors.request.use((config) => {
  const accessToken = tokenStore.get();

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetryableRequestConfig | undefined;
    const isAuthFailure = error.response?.status === 401;
    const hadAccessToken = Boolean(tokenStore.get());

    if (!config || config._retried || !isAuthFailure || !hadAccessToken) {
      return Promise.reject(error);
    }

    config._retried = true;

    const session = await refreshSession();

    if (!session) {
      tokenStore.clear();
      redirectToLogin();
      return Promise.reject(error);
    }

    config.headers.Authorization = `Bearer ${session.accessToken}`;
    return apiClient.request(config);
  },
);

function redirectToLogin(): void {
  if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
    window.location.assign('/login');
  }
}

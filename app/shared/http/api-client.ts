import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

import { BFF_AUTH_ENDPOINTS, REQUEST_TIMEOUT_MS } from './constant';
import { TAuthSession } from '../lib/auth/types';
import { clientEnv } from '../env/client';
import { tokenStore } from './token-store';

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retried?: boolean;
}

let refreshPromise: Promise<TAuthSession | null> | null = null;

async function requestSession(): Promise<TAuthSession | null> {
  try {
    const response = await fetch(BFF_AUTH_ENDPOINTS.session, {
      method: 'GET',
      credentials: 'include',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    const session = (await response.json()) as TAuthSession;

    return typeof session?.accessToken === 'string' ? session : null;
  } catch {
    return null;
  }
}

function refreshSession(): Promise<TAuthSession | null> {
  refreshPromise ??= requestSession().finally(() => {
    refreshPromise = null;
  });
  return refreshPromise;
}

export const apiClient = axios.create({
  baseURL: clientEnv.nextPublicApiUrl,
  timeout: REQUEST_TIMEOUT_MS,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: false,
});

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

    tokenStore.set(session.accessToken);
    config.headers.Authorization = `Bearer ${session.accessToken}`;
    return apiClient.request(config);
  },
);

function redirectToLogin(): void {
  if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
    window.location.assign('/login');
  }
}

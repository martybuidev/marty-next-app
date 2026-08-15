import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

import { clientEnv } from '../env/client';
import { bffSession } from '../lib/auth/auth-api.client';
import { TAuthSession } from '../lib/auth/types';
import { REQUEST_TIMEOUT_MS } from './constant';
import { tokenStore } from './token-store';

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retried?: boolean;
}

let refreshPromise: Promise<TAuthSession | null> | null = null;

function refreshSession(): Promise<TAuthSession | null> {
  refreshPromise ??= bffSession()
    .catch(() => null)
    .finally(() => {
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

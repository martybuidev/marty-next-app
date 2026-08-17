import axios, { type AxiosError, type AxiosInstance } from 'axios';

import type { TApiError } from '@/shared/types';
import { clientEnv } from '../config/client.env';
import { REQUEST_TIMEOUT_MS } from '../constants';

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }

  get isClientError(): boolean {
    return this.status >= 400 && this.status < 500;
  }
}

const NETWORK_ERROR_STATUS = 0;

const toApiError = (error: AxiosError<TApiError>): ApiError => {
  const { response } = error;
  const rawMessage = response?.data?.message ?? error.message;

  return new ApiError(
    response?.status ?? NETWORK_ERROR_STATUS,
    Array.isArray(rawMessage) ? rawMessage.join(', ') : rawMessage,
  );
};

export const createApiClient = (
  baseURL: string = clientEnv.nextPublicApiUrl,
): AxiosInstance => {
  const client = axios.create({
    baseURL,
    timeout: REQUEST_TIMEOUT_MS,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: false,
  });

  client.interceptors.response.use(
    (response) => response,
    (error: unknown) =>
      Promise.reject(
        axios.isAxiosError(error) ? toApiError(error) : (error as Error),
      ),
  );

  return client;
};

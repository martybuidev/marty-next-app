export const REQUEST_TIMEOUT_MS = 15_000;

export const REFRESH_COOKIE_NAME = 'refresh_token';

export const NEST_AUTH_ENDPOINTS = {
  login: '/auth/login',
  register: '/auth/register',
  refresh: '/auth/refresh',
  logout: '/auth/logout',
  me: '/auth/me',
} as const;

export const BFF_AUTH_ENDPOINTS = {
  login: '/api/auth/login',
  register: '/api/auth/register',
  session: '/api/auth/session',
  logout: '/api/auth/logout',
} as const;

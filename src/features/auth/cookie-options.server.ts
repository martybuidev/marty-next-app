import 'server-only';

import { serverEnv } from '@/shared/config/server.env';

export const refreshCookieOptions = {
  httpOnly: true,
  secure: serverEnv.cookieSecure,
  sameSite: 'lax' as const,
  path: '/',
  maxAge: serverEnv.refreshCookieMaxAgeSeconds,
} as const;

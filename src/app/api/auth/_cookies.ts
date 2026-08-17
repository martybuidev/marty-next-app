import 'server-only';

import { REFRESH_COOKIE_NAME } from '@/modules/auth/constants';
import { refreshCookieOptions } from '@/modules/auth/cookie-options.server';
import { cookies } from 'next/headers';


export async function getRefreshToken(): Promise<string | null> {
  const cookieStore = await cookies();

  return cookieStore.get(REFRESH_COOKIE_NAME)?.value ?? null;
}

export async function setRefreshCookie(refreshToken: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions);
}

export async function clearRefreshCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(REFRESH_COOKIE_NAME);
}

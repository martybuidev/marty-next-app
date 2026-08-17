import 'server-only';

import { cookies } from 'next/headers';
import { REFRESH_COOKIE_NAME } from '../constants/endpoints.constants';
import { refreshCookieOptions } from '../constants/cookie-options.server';


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

import { NextResponse } from 'next/server';

import { logout } from '@/modules/auth/auth-api.server';
import {
  clearRefreshCookie,
  getRefreshToken,
} from '@/modules/auth/utils/cookies';

export const dynamic = 'force-dynamic';

export async function POST(): Promise<NextResponse> {
  const refreshToken = await getRefreshToken();

  try {
    if (refreshToken) {
      await logout(refreshToken);
    }
  } catch (error) {
    console.error('[api/auth/logout] nest logout failed:', error);
  } finally {
    await clearRefreshCookie();
  }

  return NextResponse.json({ message: 'Logged out' });
}

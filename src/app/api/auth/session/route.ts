import { NextResponse } from 'next/server';

import { refresh } from '@/modules/auth/auth-api.server';
import {
  clearRefreshCookie,
  getRefreshToken,
  setRefreshCookie,
  toErrorResponse,
} from '@/modules/auth/utils';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<NextResponse> {
  const refreshToken = await getRefreshToken();

  if (!refreshToken) {
    return NextResponse.json(
      { message: 'Missing refresh token' },
      { status: 401 },
    );
  }

  try {
    const tokens = await refresh(refreshToken);
    await setRefreshCookie(tokens.refreshToken);

    return NextResponse.json({
      data: { accessToken: tokens.accessToken, user: tokens.user },
    });
  } catch (error) {
    await clearRefreshCookie();
    return toErrorResponse(error);
  }
}

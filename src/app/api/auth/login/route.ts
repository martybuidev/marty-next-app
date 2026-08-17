import { NextResponse } from 'next/server';

import { login } from '@/modules/auth/auth-api.server';
import { loginSchema } from '@/modules/auth/schemas';

import { setRefreshCookie } from '../_cookies';
import { toErrorResponse } from '../_http';

export const dynamic = 'force-dynamic';

export async function POST(request: Request): Promise<NextResponse> {
  const body = await request.json().catch(() => null);

  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: 'Validation failed' }, { status: 400 });
  }

  try {
    const tokens = await login(parsed.data);
    await setRefreshCookie(tokens.refreshToken);

    return NextResponse.json({
      data: { accessToken: tokens.accessToken, user: tokens.user },
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}

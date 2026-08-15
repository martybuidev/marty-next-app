import { NextRequest, NextResponse } from 'next/server';

import { REFRESH_COOKIE_NAME } from './app/shared/http/constant';

export function proxy(request: NextRequest) {
  const hasSession = request.cookies.has(REFRESH_COOKIE_NAME);

  if (!hasSession) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};

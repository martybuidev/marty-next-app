import { NextResponse } from 'next/server';

import { NestApiError } from '@/modules/auth/auth-api.server';

export function toErrorResponse(error: unknown): NextResponse {
  if (error instanceof NestApiError) {
    return NextResponse.json(
      { message: error.message },
      { status: error.statusCode },
    );
  }

  return NextResponse.json(
    { message: 'Internal server error' },
    { status: 500 },
  );
}

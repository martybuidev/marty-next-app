import { NextRequest } from "next/server";
import { auth } from "@/auth";

export async function proxy(request: NextRequest) {
  const session = await auth();

  if(!session) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.se
  }
}

export const config = {
    matcher: ['/dashboard/:path*'],
  }
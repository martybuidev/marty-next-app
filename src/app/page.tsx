'use client';

import { signOut, useSession } from 'next-auth/react';

export default function Home() {
  const session = useSession();
  return (
    <>
    Access Token for testing
      {session.data?.user?.accessToken}
      <button onClick={() => signOut({ redirectTo: '/login' })}>Log out</button>
    </>
  );
}

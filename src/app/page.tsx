'use client';

import { signOut, useSession } from 'next-auth/react';

export default function Home() {
  const session = useSession();
  return (
    <>
      {session.data?.user?.email}
      <button onClick={() => signOut({ redirectTo: '/login' })}>Log out</button>
    </>
  );
}

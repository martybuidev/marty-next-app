import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { REFRESH_COOKIE_NAME } from '@/modules/auth/constants';


export default async function Home() {
  const cookieStore = await cookies();
  const hasSession = cookieStore.has(REFRESH_COOKIE_NAME);

  redirect(hasSession ? '/dashboard' : '/login');
}

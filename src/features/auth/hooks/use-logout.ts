'use client';

import { useRouter } from 'next/navigation';

import { useMutation } from '@tanstack/react-query';

import { bffLogout } from '@/modules/auth/auth-api.client';
import { AUTH_QUERY_KEYS } from '@/modules/auth/constants/query-keys.constant';
import { tokenStore } from '@/modules/auth/utils/token-store';
import { queryClient } from '@/shared/lib/query-client';

export function useLogout() {
  const router = useRouter();

  return useMutation({
    mutationFn: bffLogout,
    onSuccess: () => {
      tokenStore.clear();
      queryClient.removeQueries({ queryKey: AUTH_QUERY_KEYS.session });
      router.push('/login');
    },
  });
}

'use client';

import { useMutation } from '@tanstack/react-query';

import { bffLogin } from '@/modules/auth/auth-api.client';
import { AUTH_QUERY_KEYS } from '@/modules/auth/constants/query-keys.constant';
import { type TAuthSession } from '@/modules/auth/types';
import { tokenStore } from '@/modules/auth/utils/token-store';
import { queryClient } from '@/shared/lib/query-client';

export function useLogin() {
  return useMutation({
    mutationFn: bffLogin,
    onSuccess: (session) => {
      tokenStore.set(session.accessToken);
      queryClient.setQueryData<TAuthSession>(AUTH_QUERY_KEYS.session, session);
    },
  });
}

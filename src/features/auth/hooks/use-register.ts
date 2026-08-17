'use client';

import { useMutation } from '@tanstack/react-query';

import { bffRegister } from '@/modules/auth/auth-api.client';
import { AUTH_QUERY_KEYS } from '@/modules/auth/constants/query-keys.constant';
import { type TAuthSession } from '@/modules/auth/types';
import { queryClient } from '@/shared/lib/query-client';
import { tokenStore } from '@/modules/auth/utils/token-store';

export function useRegister() {
  return useMutation({
    mutationFn: bffRegister,
    onSuccess: (session) => {
      tokenStore.set(session.accessToken);
      queryClient.setQueryData<TAuthSession>(AUTH_QUERY_KEYS.session, session);
    },
  });
}

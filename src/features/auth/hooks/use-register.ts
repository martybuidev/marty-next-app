'use client';

import { useMutation } from '@tanstack/react-query';

import { bffRegister } from '@/modules/auth/auth-api.client';
import { AUTH_QUERY_KEYS } from '@/modules/auth/constants';
import { type TAuthSession } from '@/modules/auth/types';
import { tokenStore } from '@/modules/auth/utils';
import { queryClient } from '@/shared/lib/query-client';

export function useRegister() {
  return useMutation({
    mutationFn: bffRegister,
    onSuccess: (session) => {
      tokenStore.set(session.accessToken);
      queryClient.setQueryData<TAuthSession>(AUTH_QUERY_KEYS.session, session);
    },
  });
}

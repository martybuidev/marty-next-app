'use client';

import { useEffect } from 'react';

import { useQuery } from '@tanstack/react-query';

import { bffSession } from '@/modules/auth/auth-api.client';
import { AUTH_QUERY_KEYS } from '@/modules/auth/constants/query-keys.constant';
import { tokenStore } from '@/modules/auth/utils/token-store';
import { SESSION_STALE_TIME_MS } from '@/shared/constants';

export function useSession() {
  const query = useQuery({
    queryKey: AUTH_QUERY_KEYS.session,
    queryFn: bffSession,
    retry: false,
    staleTime: SESSION_STALE_TIME_MS,
  });

  useEffect(() => {
    if (query.data) {
      tokenStore.set(query.data.accessToken);
    }
  }, [query.data]);
}

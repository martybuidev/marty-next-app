'use client';

import { useEffect } from 'react';

import { useQuery } from '@tanstack/react-query';

import { bffSession } from '@/modules/auth/auth-api.client';
import { AUTH_QUERY_KEYS } from '@/modules/auth/query-keys';
import { tokenStore } from '@/modules/auth/token-store';

export function useSession() {
  const query = useQuery({
    queryKey: AUTH_QUERY_KEYS.session,
    queryFn: bffSession,
    retry: false,
  });

  useEffect(() => {
    if (query.data) {
      tokenStore.set(query.data.accessToken);
    }
  }, [query.data]);
}

'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import { LanguageProvider } from '@/hooks/useLanguage';
import { useCurrency } from '@/hooks/useCurrency';
import { useWatchlist } from '@/hooks/useWatchlist';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: 5_000, retry: 1 } },
      }),
  );

  useEffect(() => {
    useWatchlist.persist.rehydrate();
    useCurrency.persist.rehydrate();
  }, []);

  return (
    <LanguageProvider>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </LanguageProvider>
  );
}

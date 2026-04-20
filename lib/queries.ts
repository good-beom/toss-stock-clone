import { queryOptions } from '@tanstack/react-query';

import type { CandleData, Period, SearchResult, StockQuote } from '@/types/stock';

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to load data');
  return res.json() as Promise<T>;
}

export const stockQuoteOptions = (symbol: string) =>
  queryOptions<StockQuote>({
    queryKey: ['stock', symbol, 'quote'],
    queryFn: () => fetchJson<StockQuote>(`/api/stock/${symbol}`),
    refetchInterval: 10_000,
    staleTime: 10_000,
  });

export const watchlistQuotesOptions = (symbols: string[]) => {
  const sortedKey = [...symbols].sort();
  return queryOptions<StockQuote[]>({
    queryKey: ['watchlist', 'quotes', sortedKey],
    queryFn: async () => {
      const settled = await Promise.allSettled(
        symbols.map((s) => fetchJson<StockQuote>(`/api/stock/${s}`)),
      );
      return settled
        .filter((r): r is PromiseFulfilledResult<StockQuote> => r.status === 'fulfilled')
        .map((r) => r.value);
    },
    refetchInterval: 10_000,
    staleTime: 10_000,
    enabled: symbols.length > 0,
  });
};

export const searchOptions = (query: string) =>
  queryOptions<SearchResult[]>({
    queryKey: ['search', query],
    queryFn: () => fetchJson<SearchResult[]>(`/api/search?q=${encodeURIComponent(query)}`),
    staleTime: 30_000,
    enabled: query.trim().length > 0,
  });

export const activesOptions = () =>
  queryOptions<StockQuote[]>({
    queryKey: ['market', 'actives'],
    queryFn: () => fetchJson<StockQuote[]>('/api/market/actives'),
    refetchInterval: 60_000,
    staleTime: 60_000,
  });

export const forexRateOptions = () =>
  queryOptions<{ rate: number }>({
    queryKey: ['forex', 'usdkrw'],
    queryFn: () => fetchJson<{ rate: number }>('/api/forex/rate'),
    staleTime: 3_600_000, // 1 hour
    refetchInterval: 3_600_000,
  });

export const candlesOptions = (symbol: string, period: Period) =>
  queryOptions<CandleData[]>({
    queryKey: ['stock', symbol, 'candles', period],
    queryFn: () => fetchJson<CandleData[]>(`/api/stock/${symbol}/candles?period=${period}`),
    staleTime: 60_000,
  });

import { queryOptions } from '@tanstack/react-query';

import type { CandleData, Period, StockQuote } from '@/types/stock';

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
    staleTime: 9_000,
  });

export const candlesOptions = (symbol: string, period: Period) =>
  queryOptions<CandleData[]>({
    queryKey: ['stock', symbol, 'candles', period],
    queryFn: () => fetchJson<CandleData[]>(`/api/stock/${symbol}/candles?period=${period}`),
    staleTime: 60_000,
  });

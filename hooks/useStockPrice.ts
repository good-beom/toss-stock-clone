'use client';

import { useSuspenseQuery } from '@tanstack/react-query';

import { stockQuoteOptions } from '@/lib/queries';
import type { StockQuote } from '@/types/stock';

export function useStockPrice(symbol: string, initialData?: StockQuote) {
  return useSuspenseQuery({
    ...stockQuoteOptions(symbol),
    initialData,
  });
}

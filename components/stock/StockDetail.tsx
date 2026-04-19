'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

import { PriceHeader } from '@/components/stock/PriceHeader';
import { PeriodTabs } from '@/components/chart/PeriodTabs';
import { useRecentSymbols } from '@/hooks/useRecentSymbols';
import { useStockPrice } from '@/hooks/useStockPrice';
import type { Period, StockQuote } from '@/types/stock';

const CandleChart = dynamic(
  () => import('@/components/chart/CandleChart').then((m) => m.CandleChart),
  { ssr: false, loading: () => <div className="w-full h-[300px] bg-zinc-900 animate-pulse" /> },
);

interface Props {
  symbol: string;
  initialQuote: StockQuote;
}

export function StockDetail({ symbol, initialQuote }: Props) {
  const [period, setPeriod] = useState<Period>('1D');
  const { data: quote } = useStockPrice(symbol, initialQuote);
  const { addSymbol } = useRecentSymbols();

  useEffect(() => {
    addSymbol(symbol);
  }, [symbol, addSymbol]);

  return (
    <div className="flex flex-col bg-[#161616] min-h-screen text-white">
      <PriceHeader quote={quote} />
      <CandleChart symbol={symbol} period={period} />
      <PeriodTabs value={period} onValueChange={setPeriod} />
    </div>
  );
}

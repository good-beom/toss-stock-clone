'use client';

import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { PriceHeader } from '@/components/stock/PriceHeader';
import { StockStats } from '@/components/stock/StockStats';
import { PeriodTabs } from '@/components/chart/PeriodTabs';
import { WatchlistButton } from '@/components/stock/WatchlistButton';
import { useLanguage } from '@/hooks/useLanguage';
import { useRecentSymbols } from '@/hooks/useRecentSymbols';
import { useStockPrice } from '@/hooks/useStockPrice';
import type { Period, StockQuote } from '@/types/stock';

const CandleChart = dynamic(
  () => import('@/components/chart/CandleChart').then((m) => m.CandleChart),
  { ssr: false, loading: () => <div className="w-full h-[360px] bg-zinc-900 animate-pulse" /> },
);

interface Props {
  symbol: string;
  initialQuote: StockQuote;
}

export function StockDetail({ symbol, initialQuote }: Props) {
  const router = useRouter();
  const { tr } = useLanguage();
  const [period, setPeriod] = useState<Period>('1D');
  const { data: quote } = useStockPrice(symbol, initialQuote);
  const { addSymbol } = useRecentSymbols();

  useEffect(() => {
    addSymbol(symbol);
  }, [symbol, addSymbol]);

  return (
    <div className="flex flex-col bg-[#161616] min-h-screen text-white pb-16">
      <div className="flex items-center px-2 pt-4">
        <button
          onClick={() => router.back()}
          aria-label={tr.stock.backLabel}
          className="p-2 rounded-full hover:bg-zinc-800 transition-colors"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
      </div>
      <PriceHeader quote={quote} />
      <div className="px-4 pb-2">
        <WatchlistButton symbol={symbol} name={quote.name} />
      </div>
      <CandleChart symbol={symbol} period={period} />
      <PeriodTabs value={period} onValueChange={setPeriod} />
      <StockStats quote={quote} />
    </div>
  );
}

'use client';

import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { PriceHeader } from '@/components/stock/PriceHeader';
import { StockStats } from '@/components/stock/StockStats';
import { PeriodTabs } from '@/components/chart/PeriodTabs';
import { WatchlistButton } from '@/components/stock/WatchlistButton';
import { useCurrencyDisplay } from '@/hooks/useCurrencyDisplay';
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
  const { displayCurrency, toggle: toggleCurrency } = useCurrencyDisplay();
  const [period, setPeriod] = useState<Period>('1D');
  const { data: quote } = useStockPrice(symbol, initialQuote);
  const { addSymbol } = useRecentSymbols();

  useEffect(() => {
    addSymbol(symbol);
  }, [symbol, addSymbol]);

  const gradientClass =
    quote.change > 0 ? 'from-red-900/20' : quote.change < 0 ? 'from-blue-900/20' : 'from-zinc-800/20';

  return (
    <div className="relative flex flex-col bg-[#161616] min-h-screen text-white pb-16">
      <div className={`absolute inset-x-0 top-0 h-56 bg-gradient-to-b ${gradientClass} to-transparent pointer-events-none`} />
      <div className="relative flex items-center justify-between px-2 pt-4">
        <button
          onClick={() => router.back()}
          aria-label={tr.stock.backLabel}
          className="p-2 rounded-full hover:bg-zinc-800 transition-colors"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        <button
          onClick={toggleCurrency}
          className="flex flex-col items-center justify-center w-12 h-9 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 transition-colors mr-2"
          aria-label="Toggle currency"
        >
          <span className="text-sm font-semibold text-white leading-none">
            {displayCurrency === 'USD' ? '$' : '₩'}
          </span>
          <span className="text-[10px] text-zinc-400 mt-0.5">{displayCurrency}</span>
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

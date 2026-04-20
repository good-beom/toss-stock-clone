'use client';

import { useCurrencyDisplay } from '@/hooks/useCurrencyDisplay';
import { useLanguage } from '@/hooks/useLanguage';
import { formatMarketCap, formatVolume } from '@/lib/format';
import type { StockQuote } from '@/types/stock';

interface Props {
  quote: StockQuote;
}

export function StockStats({ quote }: Props) {
  const { tr } = useLanguage();
  const { formatDisplayPrice } = useCurrencyDisplay();
  const s = tr.stats;

  const items: { label: string; value: string | undefined }[] = [
    {
      label: s.high52w,
      value: quote.fiftyTwoWeekHigh != null ? formatDisplayPrice(quote.fiftyTwoWeekHigh, quote.currency) : undefined,
    },
    {
      label: s.low52w,
      value: quote.fiftyTwoWeekLow != null ? formatDisplayPrice(quote.fiftyTwoWeekLow, quote.currency) : undefined,
    },
    {
      label: s.marketCap,
      value: quote.marketCap != null ? formatMarketCap(quote.marketCap) : undefined,
    },
    {
      label: s.pe,
      value: quote.trailingPE != null ? quote.trailingPE.toFixed(2) : undefined,
    },
    {
      label: s.volume,
      value: formatVolume(quote.volume),
    },
    {
      label: s.avgVolume,
      value: quote.averageVolume != null ? formatVolume(quote.averageVolume) : undefined,
    },
  ];

  return (
    <div className="mx-4 mt-4 rounded-xl bg-zinc-900 divide-y divide-zinc-800">
      {items.map(({ label, value }) => (
        <div key={label} className="flex items-center justify-between px-4 py-3">
          <span className="text-sm text-zinc-400">{label}</span>
          <span className="text-sm text-white font-medium">{value ?? '—'}</span>
        </div>
      ))}
    </div>
  );
}

'use client';

import { useLanguage } from '@/hooks/useLanguage';
import { KOREAN_NAMES } from '@/lib/koreanNames';
import { formatPrice, priceChangeColor, priceChangeSign } from '@/lib/format';
import type { StockQuote } from '@/types/stock';

const MARKET_STATE_COLORS: Record<string, string> = {
  REGULAR: 'bg-green-500',
  PRE: 'bg-yellow-400',
  PREPRE: 'bg-yellow-400',
  POST: 'bg-orange-400',
  POSTPOST: 'bg-orange-400',
  CLOSED: 'bg-zinc-500',
};

interface Props {
  quote: StockQuote;
}

export function PriceHeader({ quote }: Props) {
  const { lang, tr } = useLanguage();
  const color = priceChangeColor(quote.change);
  const sign = priceChangeSign(quote.change);
  const koreanName = lang === 'ko' ? KOREAN_NAMES[quote.symbol] : undefined;
  const state = quote.marketState;
  const stateLabel = state ? (tr.marketState as Record<string, string>)[state] : undefined;
  const stateDot = state ? (MARKET_STATE_COLORS[state] ?? 'bg-zinc-500') : undefined;

  return (
    <div className="px-4 pt-6 pb-2">
      <div className="flex items-center gap-2">
        <p className="text-sm text-zinc-400">{quote.name}</p>
        {stateLabel && stateDot && (
          <span className="flex items-center gap-1 text-xs text-zinc-400">
            <span className={`w-1.5 h-1.5 rounded-full ${stateDot}`} />
            {stateLabel}
          </span>
        )}
      </div>
      {koreanName && (
        <p className="text-xs text-zinc-500 mt-0.5">{koreanName}</p>
      )}
      <p className="text-3xl font-bold text-white mt-2">
        {formatPrice(quote.price, quote.currency)}
      </p>
      <p className={`text-sm mt-1 ${color}`}>
        {sign}{quote.change.toFixed(2)} ({sign}{quote.changePercent.toFixed(2)}%)
      </p>
    </div>
  );
}

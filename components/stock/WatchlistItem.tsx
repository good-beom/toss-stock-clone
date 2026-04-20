'use client';

import Link from 'next/link';

import { formatPrice, priceChangeColor, priceChangeSign } from '@/lib/format';
import { useWatchlist } from '@/hooks/useWatchlist';
import type { StockQuote, WatchlistItem as WatchlistItemType } from '@/types/stock';

interface Props {
  item: WatchlistItemType;
  quote?: StockQuote;
}

export function WatchlistItem({ item, quote }: Props) {
  const remove = useWatchlist((s) => s.remove);

  const color = priceChangeColor(quote?.change ?? 0);
  const sign = priceChangeSign(quote?.change ?? 0);

  return (
    <li className="flex items-center justify-between px-4 py-3 hover:bg-zinc-800/50 transition-colors">
      <Link href={`/stock/${item.symbol}`} className="flex flex-col gap-0.5 flex-1 min-w-0">
        <span className="text-sm font-semibold text-white">{item.symbol}</span>
        <span className="text-xs text-zinc-400 truncate">{item.name}</span>
      </Link>

      <div className="flex items-center gap-3 ml-4 shrink-0">
        {quote ? (
          <div className="text-right">
            <p className="text-sm font-medium text-white">
              {formatPrice(quote.price, quote.currency)}
            </p>
            <p className={`text-xs ${color}`}>
              {sign}{quote.changePercent.toFixed(2)}%
            </p>
          </div>
        ) : (
          <div className="w-16 h-8 bg-zinc-800 animate-pulse rounded" />
        )}

        <button
          onClick={() => remove(item.symbol)}
          aria-label={`${item.symbol} 관심 종목 제거`}
          className="text-zinc-500 hover:text-yellow-400 transition-colors text-lg leading-none"
        >
          ★
        </button>
      </div>
    </li>
  );
}

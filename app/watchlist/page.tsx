'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { useLanguage } from '@/hooks/useLanguage';
import { useWatchlist } from '@/hooks/useWatchlist';
import { watchlistQuotesOptions } from '@/lib/queries';
import { WatchlistItem } from '@/components/stock/WatchlistItem';

export default function WatchlistPage() {
  const { tr } = useLanguage();
  const items = useWatchlist((s) => s.items);

  const symbols = useMemo(() => items.map((i) => i.symbol), [items]);
  const { data: quotes } = useQuery(watchlistQuotesOptions(symbols));

  const quotesBySymbol = useMemo(() => {
    const map = new Map<string, (typeof quotes)[number]>();
    for (const q of quotes ?? []) map.set(q.symbol, q);
    return map;
  }, [quotes]);

  return (
    <main className="flex flex-col min-h-screen bg-[#161616] text-white px-0 pt-12 pb-20">
      <h1 className="text-xl font-bold mb-6 px-4">{tr.watchlist.title}</h1>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 gap-2 text-zinc-500">
          <p className="text-sm">{tr.watchlist.empty}</p>
          <p className="text-xs">{tr.watchlist.emptyHint}</p>
        </div>
      ) : (
        <ul className="flex flex-col divide-y divide-zinc-800">
          {items.map((item) => (
            <WatchlistItem key={item.symbol} item={item} quote={quotesBySymbol.get(item.symbol)} />
          ))}
        </ul>
      )}
    </main>
  );
}

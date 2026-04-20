'use client';

import { useQuery } from '@tanstack/react-query';

import { watchlistQuotesOptions } from '@/lib/queries';
import { useWatchlist } from '@/hooks/useWatchlist';
import { WatchlistItem } from '@/components/stock/WatchlistItem';

export default function WatchlistPage() {
  const items = useWatchlist((s) => s.items);
  const symbols = items.map((i) => i.symbol);

  const { data: quotes = [] } = useQuery(watchlistQuotesOptions(symbols));

  return (
    <main className="flex flex-col min-h-screen bg-[#161616] text-white px-0 pt-12 pb-8">
      <h1 className="text-xl font-bold mb-6 px-4">관심 종목</h1>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 gap-2 text-zinc-500">
          <p className="text-sm">관심 종목이 없습니다</p>
          <p className="text-xs">종목 상세 페이지에서 ☆ 버튼으로 추가하세요</p>
        </div>
      ) : (
        <ul className="flex flex-col divide-y divide-zinc-800">
          {items.map((item, i) => (
            <WatchlistItem key={item.symbol} item={item} quote={quotes[i]} />
          ))}
        </ul>
      )}
    </main>
  );
}

'use client';

import { useWatchlist } from '@/hooks/useWatchlist';

interface Props {
  symbol: string;
  name: string;
}

export function WatchlistButton({ symbol, name }: Props) {
  const isWatched = useWatchlist((s) => s.items.some((i) => i.symbol === symbol));
  const add = useWatchlist((s) => s.add);
  const remove = useWatchlist((s) => s.remove);

  function handleToggle() {
    if (isWatched) {
      remove(symbol);
    } else {
      add({ symbol, name });
    }
  }

  return (
    <button
      onClick={handleToggle}
      aria-label={isWatched ? '관심 종목 제거' : '관심 종목 추가'}
      className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
        isWatched
          ? 'bg-yellow-400/15 text-yellow-400 hover:bg-yellow-400/25'
          : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
      }`}
    >
      <span>{isWatched ? '★' : '☆'}</span>
      <span>{isWatched ? '관심 종목' : '추가'}</span>
    </button>
  );
}

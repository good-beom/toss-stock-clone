'use client';

import { useRouter } from 'next/navigation';
import { useDeferredValue, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { useLanguage } from '@/hooks/useLanguage';
import { useRecentSymbols } from '@/hooks/useRecentSymbols';
import { KOREAN_NAMES } from '@/lib/koreanNames';
import { searchOptions } from '@/lib/queries';
import type { SearchResult } from '@/types/stock';

export function StockSearchBar() {
  const router = useRouter();
  const { lang, tr } = useLanguage();
  const [input, setInput] = useState('');
  const deferredQuery = useDeferredValue(input.trim());
  const { symbols: recentSymbols } = useRecentSymbols();

  const { data: results = [], isFetching } = useQuery(searchOptions(deferredQuery));

  function handleSelect(symbol: string) {
    router.push(`/stock/${symbol}`);
  }

  const showResults = deferredQuery.length > 0;
  const showRecent = !showResults && recentSymbols.length > 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={tr.search.placeholder}
          className="w-full bg-zinc-800 text-white placeholder-zinc-500 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-zinc-600"
          autoFocus
        />
        {isFetching && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-zinc-500 border-t-white rounded-full animate-spin" />
        )}
      </div>

      {showResults && (
        <ResultList
          items={results}
          onSelect={handleSelect}
          emptyText={isFetching ? tr.search.searching : tr.search.noResults}
          showKorean={lang === 'ko'}
        />
      )}

      {showRecent && (
        <section>
          <p className="text-xs text-zinc-500 px-1 mb-2">{tr.search.recent}</p>
          <RecentList symbols={recentSymbols} onSelect={handleSelect} />
        </section>
      )}
    </div>
  );
}

interface ResultListProps {
  items: SearchResult[];
  onSelect: (symbol: string) => void;
  emptyText: string;
  showKorean: boolean;
}

function ResultList({ items, onSelect, emptyText, showKorean }: ResultListProps) {
  if (items.length === 0) {
    return <p className="text-sm text-zinc-500 text-center py-8">{emptyText}</p>;
  }

  return (
    <ul className="flex flex-col">
      {items.map((item) => {
        const koreanName = showKorean ? KOREAN_NAMES[item.symbol] : undefined;
        return (
          <li key={item.symbol}>
            <button
              onClick={() => onSelect(item.symbol)}
              className="w-full flex items-center justify-between px-2 py-3 rounded-lg hover:bg-zinc-800 transition-colors text-left"
            >
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-white">{item.symbol}</span>
                  {koreanName && (
                    <span className="text-xs text-zinc-300">{koreanName}</span>
                  )}
                </div>
                <span className="text-xs text-zinc-400">{item.name}</span>
              </div>
              <span className="text-xs text-zinc-500 shrink-0 ml-2">{item.exchange}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

interface RecentListProps {
  symbols: string[];
  onSelect: (symbol: string) => void;
}

function RecentList({ symbols, onSelect }: RecentListProps) {
  return (
    <ul className="flex flex-wrap gap-2">
      {symbols.map((symbol) => (
        <li key={symbol}>
          <button
            onClick={() => onSelect(symbol)}
            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-sm text-white rounded-full transition-colors"
          >
            {symbol}
          </button>
        </li>
      ))}
    </ul>
  );
}

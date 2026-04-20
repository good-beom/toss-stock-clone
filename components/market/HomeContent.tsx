'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDeferredValue, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { ActivesList } from '@/components/market/ActivesList';
import { useCurrencyDisplay } from '@/hooks/useCurrencyDisplay';
import { useLanguage } from '@/hooks/useLanguage';
import { KOREAN_NAMES } from '@/lib/koreanNames';
import { searchOptions } from '@/lib/queries';
import type { SearchResult, StockQuote } from '@/types/stock';

interface Props {
  initialData: StockQuote[];
}

export function HomeContent({ initialData }: Props) {
  const router = useRouter();
  const { lang, tr } = useLanguage();
  const { displayCurrency, toggle: toggleCurrency, formatDisplayPrice } = useCurrencyDisplay();
  const [input, setInput] = useState('');
  const deferredQuery = useDeferredValue(input.trim());

  const { data: results = [], isFetching } = useQuery(searchOptions(deferredQuery));

  const showSearch = deferredQuery.length > 0;

  return (
    <div className="flex flex-col">
      {/* Search bar + currency toggle */}
      <div className="px-4 pt-4 pb-3 flex items-center gap-2">
        <div className="relative flex-1">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </div>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={tr.search.placeholder}
            className="w-full bg-zinc-800/80 text-white placeholder-zinc-500 rounded-xl pl-9 pr-9 py-3 text-sm outline-none focus:ring-2 focus:ring-zinc-600 transition-all"
          />
          {isFetching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-zinc-600 border-t-zinc-300 rounded-full animate-spin" />
          )}
          {input && !isFetching && (
            <button
              onClick={() => setInput('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors text-lg leading-none"
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>

        <button
          onClick={toggleCurrency}
          className="shrink-0 flex flex-col items-center justify-center w-12 h-11 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 transition-colors"
          aria-label="Toggle currency"
        >
          <span className="text-sm font-semibold text-white leading-none">
            {displayCurrency === 'USD' ? '$' : '₩'}
          </span>
          <span className="text-[10px] text-zinc-400 mt-0.5">
            {displayCurrency}
          </span>
        </button>
      </div>

      {showSearch ? (
        <SearchResults
          results={results}
          isFetching={isFetching}
          query={deferredQuery}
          lang={lang}
          tr={tr}
          formatDisplayPrice={formatDisplayPrice}
          onSelect={(s) => router.push(`/stock/${s}`)}
        />
      ) : (
        <>
          <div className="px-4 mb-3">
            <h1 className="text-xl font-bold">{tr.home.title}</h1>
            <p className="text-xs text-zinc-500 mt-1">{tr.home.subtitle}</p>
          </div>
          <ActivesList initialData={initialData} />
        </>
      )}
    </div>
  );
}

interface SearchResultsProps {
  results: SearchResult[];
  isFetching: boolean;
  query: string;
  lang: string;
  tr: { search: { searching: string; noResults: string } };
  formatDisplayPrice: (price: number, currency: string) => string;
  onSelect: (symbol: string) => void;
}

function SearchResults({ results, isFetching, lang, tr, onSelect }: SearchResultsProps) {
  if (results.length === 0) {
    return (
      <p className="text-sm text-zinc-500 text-center py-12">
        {isFetching ? tr.search.searching : tr.search.noResults}
      </p>
    );
  }

  return (
    <ul className="flex flex-col px-2">
      {results.map((item) => {
        const koreanName = lang === 'ko' ? KOREAN_NAMES[item.symbol] : undefined;
        return (
          <li key={item.symbol}>
            <Link
              href={`/stock/${item.symbol}`}
              onClick={() => onSelect(item.symbol)}
              className="flex items-center justify-between px-3 py-3 rounded-xl hover:bg-zinc-800/60 transition-colors"
            >
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-white">{item.symbol}</span>
                  {koreanName && <span className="text-xs text-zinc-300">{koreanName}</span>}
                </div>
                <span className="text-xs text-zinc-400">{item.name}</span>
              </div>
              <span className="text-xs text-zinc-500 shrink-0 ml-2 bg-zinc-800 px-2 py-0.5 rounded-md">
                {item.exchange}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

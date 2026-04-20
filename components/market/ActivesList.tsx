'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';

import { useLanguage } from '@/hooks/useLanguage';
import { activesOptions } from '@/lib/queries';
import { formatPrice, formatVolume, priceChangeColor, priceChangeSign } from '@/lib/format';
import { KOREAN_NAMES } from '@/lib/koreanNames';
import type { StockQuote } from '@/types/stock';

interface Props {
  initialData: StockQuote[];
}

export function ActivesList({ initialData }: Props) {
  const { lang } = useLanguage();
  const { data: stocks } = useQuery({ ...activesOptions(), initialData });

  return (
    <ul className="flex flex-col divide-y divide-zinc-800/60">
      {stocks.map((stock, i) => {
        const color = priceChangeColor(stock.changePercent);
        const sign = priceChangeSign(stock.changePercent);
        const koreanName = lang === 'ko' ? KOREAN_NAMES[stock.symbol] : undefined;

        return (
          <li key={stock.symbol}>
            <Link
              href={`/stock/${stock.symbol}`}
              className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-800/40 transition-colors"
            >
              <span className="text-xs text-zinc-600 w-6 shrink-0 text-right">{i + 1}</span>

              <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-white">{stock.symbol}</span>
                  {koreanName && (
                    <span className="text-xs text-zinc-300">{koreanName}</span>
                  )}
                </div>
                <span className="text-xs text-zinc-400 truncate">{stock.name}</span>
              </div>

              <div className="text-right shrink-0">
                <p className="text-sm font-medium text-white">
                  {formatPrice(stock.price, stock.currency)}
                </p>
                <p className={`text-xs ${color}`}>
                  {sign}{stock.changePercent.toFixed(2)}%
                </p>
              </div>

              <div className="text-right shrink-0 w-14 hidden sm:block">
                <p className="text-xs text-zinc-500">{formatVolume(stock.volume)}</p>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

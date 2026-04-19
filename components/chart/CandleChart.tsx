'use client';

import { useRef } from 'react';
import { useQuery } from '@tanstack/react-query';

import { useCandleChart } from '@/hooks/useCandleChart';
import { candlesOptions } from '@/lib/queries';
import type { Period } from '@/types/stock';

interface Props {
  symbol: string;
  period: Period;
}

export function CandleChart({ symbol, period }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  const { data = [], isFetching } = useQuery({
    ...candlesOptions(symbol, period),
    placeholderData: (prev) => prev,
  });

  useCandleChart(containerRef, data);

  return (
    <div className="relative w-full">
      <div ref={containerRef} className="w-full h-[300px]" />
      {isFetching && (
        <div className="absolute top-2 right-4 w-2 h-2 rounded-full bg-zinc-500 animate-pulse" />
      )}
    </div>
  );
}

'use client';

import { useRef } from 'react';
import { useQuery } from '@tanstack/react-query';

import { useCandleChart } from '@/hooks/useCandleChart';
import { candlesOptions } from '@/lib/queries';
import { formatVolume } from '@/lib/format';
import type { Period } from '@/types/stock';

interface Props {
  symbol: string;
  period: Period;
}

function formatTooltipTime(time: number, period: Period): string {
  const date = new Date(time * 1000);
  if (period === '1D') {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function CandleChart({ symbol, period }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  const { data = [], isFetching } = useQuery({
    ...candlesOptions(symbol, period),
    placeholderData: (prev) => prev,
  });

  const { tooltipData } = useCandleChart(containerRef, data);

  const display = tooltipData ?? (data.length > 0 ? data[data.length - 1] : null);

  return (
    <div className="relative w-full">
      <div ref={containerRef} className="w-full h-[360px]" />
      {display && (
        <div className="absolute top-2 left-3 text-[11px] text-zinc-400 leading-5 pointer-events-none">
          <span className="mr-2 text-zinc-500">{formatTooltipTime(display.time, period)}</span>
          <span className="mr-1.5">O <span className="text-white">{display.open.toFixed(2)}</span></span>
          <span className="mr-1.5">H <span className="text-white">{display.high.toFixed(2)}</span></span>
          <span className="mr-1.5">L <span className="text-white">{display.low.toFixed(2)}</span></span>
          <span className="mr-1.5">C <span className="text-white">{display.close.toFixed(2)}</span></span>
          <span>Vol <span className="text-white">{formatVolume(display.volume)}</span></span>
        </div>
      )}
      {isFetching && (
        <div className="absolute top-2 right-4 w-2 h-2 rounded-full bg-zinc-500 animate-pulse" />
      )}
    </div>
  );
}

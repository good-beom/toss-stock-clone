'use client';

import { useEffect, useRef } from 'react';
import { CandlestickSeries, createChart } from 'lightweight-charts';
import type { IChartApi, ISeriesApi, UTCTimestamp } from 'lightweight-charts';

import type { CandleData } from '@/types/stock';

export function useCandleChart(
  containerRef: React.RefObject<HTMLDivElement | null>,
  data: CandleData[],
) {
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const chart = createChart(el, {
      autoSize: true,
      layout: {
        background: { color: '#161616' },
        textColor: '#a1a1aa',
      },
      grid: {
        vertLines: { color: '#27272a' },
        horzLines: { color: '#27272a' },
      },
      crosshair: { mode: 1 },
      rightPriceScale: { borderColor: '#3f3f46' },
      timeScale: { borderColor: '#3f3f46', timeVisible: true },
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: '#ef4444',
      downColor: '#3b82f6',
      borderUpColor: '#ef4444',
      borderDownColor: '#3b82f6',
      wickUpColor: '#ef4444',
      wickDownColor: '#3b82f6',
    });

    chartRef.current = chart;
    seriesRef.current = series;

    return () => {
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- containerRef is stable

  useEffect(() => {
    if (!seriesRef.current || data.length === 0) return;
    seriesRef.current.setData(
      data.map((d) => ({ ...d, time: d.time as UTCTimestamp })),
    );
    chartRef.current?.timeScale().fitContent();
  }, [data]);
}

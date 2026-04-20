'use client';

import { useEffect, useRef, useState } from 'react';
import { CandlestickSeries, HistogramSeries, createChart } from 'lightweight-charts';
import type { IChartApi, ISeriesApi, UTCTimestamp } from 'lightweight-charts';

import type { CandleData } from '@/types/stock';

export interface TooltipData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export function useCandleChart(
  containerRef: React.RefObject<HTMLDivElement | null>,
  data: CandleData[],
) {
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const [tooltipData, setTooltipData] = useState<TooltipData | null>(null);

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

    const volume = chart.addSeries(HistogramSeries, {
      priceScaleId: 'volume',
      color: '#52525b',
    });
    chart.priceScale('volume').applyOptions({
      scaleMargins: { top: 0.82, bottom: 0 },
      visible: false,
    });

    chart.subscribeCrosshairMove((param) => {
      if (!param.time || !param.seriesData.get(series)) {
        setTooltipData((prev) => (prev === null ? prev : null));
        return;
      }
      const candle = param.seriesData.get(series) as {
        open: number;
        high: number;
        low: number;
        close: number;
      };
      const vol = (param.seriesData.get(volume) as { value: number } | undefined)?.value ?? 0;
      const time = param.time as number;
      setTooltipData((prev) => {
        if (
          prev !== null &&
          prev.time === time &&
          prev.open === candle.open &&
          prev.high === candle.high &&
          prev.low === candle.low &&
          prev.close === candle.close &&
          prev.volume === vol
        ) {
          return prev;
        }
        return {
          time,
          open: candle.open,
          high: candle.high,
          low: candle.low,
          close: candle.close,
          volume: vol,
        };
      });
    });

    chartRef.current = chart;
    seriesRef.current = series;
    volumeRef.current = volume;

    return () => {
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
      volumeRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- containerRef is stable

  useEffect(() => {
    if (!seriesRef.current || !volumeRef.current || data.length === 0) return;

    const candles = new Array(data.length);
    const volumes = new Array(data.length);
    for (let i = 0; i < data.length; i++) {
      const d = data[i];
      const time = d.time as UTCTimestamp;
      candles[i] = { time, open: d.open, high: d.high, low: d.low, close: d.close };
      volumes[i] = {
        time,
        value: d.volume,
        color: d.close >= d.open ? '#ef444460' : '#3b82f660',
      };
    }
    seriesRef.current.setData(candles);
    volumeRef.current.setData(volumes);
    chartRef.current?.timeScale().fitContent();
  }, [data]);

  return { tooltipData };
}

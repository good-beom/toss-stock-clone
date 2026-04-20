import YahooFinance from 'yahoo-finance2';

import type { CandleData, Period, SearchResult, StockQuote } from '@/types/stock';

const yf = new YahooFinance({ suppressNotices: ['yahooSurvey'] });

const PERIOD_CONFIG = {
  '1D': { interval: '5m' as const, daysBack: 5 },
  '1W': { interval: '30m' as const, daysBack: 7 },
  '1M': { interval: '1d' as const, daysBack: 30 },
  '3M': { interval: '1d' as const, daysBack: 90 },
  '1Y': { interval: '1d' as const, daysBack: 365 },
  '5Y': { interval: '1wk' as const, daysBack: 365 * 5 },
} satisfies Record<Period, { interval: string; daysBack: number }>;

export async function getQuote(symbol: string): Promise<StockQuote> {
  const result = await yf.quote(symbol);
  return {
    symbol: result.symbol,
    name: result.longName ?? result.shortName ?? symbol,
    price: result.regularMarketPrice ?? 0,
    change: result.regularMarketChange ?? 0,
    changePercent: result.regularMarketChangePercent ?? 0,
    volume: result.regularMarketVolume ?? 0,
    marketCap: result.marketCap ?? undefined,
    currency: result.currency ?? 'USD',
  };
}

export async function getCandles(symbol: string, period: Period): Promise<CandleData[]> {
  const { interval, daysBack } = PERIOD_CONFIG[period];
  const period1 = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);

  const result = await yf.chart(symbol, { period1, interval });

  const candles = result.quotes.reduce<CandleData[]>((acc, q) => {
    if (q.open == null || q.high == null || q.low == null || q.close == null) return acc;
    acc.push({
      time: Math.floor(q.date.getTime() / 1000),
      open: q.open,
      high: q.high,
      low: q.low,
      close: q.close,
      volume: q.volume ?? 0,
    });
    return acc;
  }, []);

  // For 1D, keep only the most recent trading day (handles weekends and holidays)
  if (period === '1D' && candles.length > 0) {
    const lastDay = new Date(candles[candles.length - 1].time * 1000).toDateString();
    return candles.filter((c) => new Date(c.time * 1000).toDateString() === lastDay);
  }

  return candles;
}

export async function getTopActives(count = 50): Promise<StockQuote[]> {
  const result = await yf.screener({ scrIds: 'most_actives', count });
  const quotes: StockQuote[] = [];
  for (const raw of result.quotes) {
    const q = raw as unknown as Record<string, unknown>;
    if (typeof q.regularMarketPrice !== 'number') continue;
    quotes.push({
      symbol: String(q.symbol),
      name: String(q.longName ?? q.shortName ?? q.symbol),
      price: q.regularMarketPrice,
      change: typeof q.regularMarketChange === 'number' ? q.regularMarketChange : 0,
      changePercent: typeof q.regularMarketChangePercent === 'number' ? q.regularMarketChangePercent : 0,
      volume: typeof q.regularMarketVolume === 'number' ? q.regularMarketVolume : 0,
      marketCap: typeof q.marketCap === 'number' ? q.marketCap : undefined,
      currency: typeof q.currency === 'string' ? q.currency : 'USD',
    });
  }
  return quotes;
}

export async function searchSymbol(query: string): Promise<SearchResult[]> {
  const result = await yf.search(query);
  const out: SearchResult[] = [];
  for (const q of result.quotes ?? []) {
    if (!q.isYahooFinance) continue;
    out.push({
      symbol: q.symbol,
      name: q.longname ?? q.shortname ?? q.symbol,
      exchange: q.exchange,
      type: 'typeDisp' in q ? String(q.typeDisp) : '',
    });
  }
  return out;
}

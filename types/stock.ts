export type Period = '1D' | '1W' | '1M' | '3M' | '1Y' | '5Y';

export const PERIODS: Period[] = ['1D', '1W', '1M', '3M', '1Y', '5Y'];

export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  currency: string;
  // detail stats
  marketState?: string;
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?: number;
  trailingPE?: number;
  averageVolume?: number;
}

export interface CandleData {
  time: number; // Unix timestamp (seconds)
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface SearchResult {
  symbol: string;
  name: string;
  exchange: string;
  type: string;
}

export interface WatchlistItem {
  symbol: string;
  name: string;
  addedAt: number; // Unix timestamp (ms)
}

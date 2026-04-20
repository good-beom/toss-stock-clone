export function formatPrice(price: number, currency: string): string {
  return price.toLocaleString('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  });
}

export function priceChangeColor(change: number): string {
  if (change > 0) return 'text-red-400';
  if (change < 0) return 'text-blue-400';
  return 'text-zinc-400';
}

export function priceChangeSign(change: number): string {
  return change > 0 ? '+' : '';
}

export function formatVolume(volume: number): string {
  if (volume >= 1_000_000_000) return `${(volume / 1_000_000_000).toFixed(1)}B`;
  if (volume >= 1_000_000) return `${(volume / 1_000_000).toFixed(1)}M`;
  if (volume >= 1_000) return `${(volume / 1_000).toFixed(0)}K`;
  return String(volume);
}

export function formatMarketCap(value: number): string {
  if (value >= 1_000_000_000_000) return `${(value / 1_000_000_000_000).toFixed(2)}T`;
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
  return String(value);
}

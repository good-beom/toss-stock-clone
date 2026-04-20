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

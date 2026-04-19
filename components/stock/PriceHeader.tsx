import type { StockQuote } from '@/types/stock';

interface Props {
  quote: StockQuote;
}

export function PriceHeader({ quote }: Props) {
  const isPositive = quote.change >= 0;
  const changeColor = isPositive ? 'text-red-400' : 'text-blue-400';
  const sign = isPositive ? '+' : '';

  return (
    <div className="px-4 pt-6 pb-2">
      <p className="text-sm text-zinc-400">{quote.name}</p>
      <p className="text-3xl font-bold text-white mt-1">
        {quote.price.toLocaleString('en-US', {
          style: 'currency',
          currency: quote.currency,
          maximumFractionDigits: 2,
        })}
      </p>
      <p className={`text-sm mt-1 ${changeColor}`}>
        {sign}
        {quote.change.toFixed(2)} ({sign}
        {quote.changePercent.toFixed(2)}%)
      </p>
    </div>
  );
}

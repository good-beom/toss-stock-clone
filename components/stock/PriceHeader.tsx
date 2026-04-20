import { formatPrice, priceChangeColor, priceChangeSign } from '@/lib/format';
import type { StockQuote } from '@/types/stock';

interface Props {
  quote: StockQuote;
}

export function PriceHeader({ quote }: Props) {
  const color = priceChangeColor(quote.change);
  const sign = priceChangeSign(quote.change);

  return (
    <div className="px-4 pt-6 pb-2">
      <p className="text-sm text-zinc-400">{quote.name}</p>
      <p className="text-3xl font-bold text-white mt-1">
        {formatPrice(quote.price, quote.currency)}
      </p>
      <p className={`text-sm mt-1 ${color}`}>
        {sign}{quote.change.toFixed(2)} ({sign}{quote.changePercent.toFixed(2)}%)
      </p>
    </div>
  );
}

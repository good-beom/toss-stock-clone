import { Suspense } from 'react';

import { StockDetail } from '@/components/stock/StockDetail';
import { getQuote } from '@/lib/yahoo';

type Props = { params: Promise<{ symbol: string }> };

export default async function StockPage({ params }: Props) {
  const symbol = (await params).symbol.toUpperCase();
  const initialQuote = await getQuote(symbol);

  return (
    <Suspense fallback={<div className="w-full h-screen bg-[#161616] animate-pulse" />}>
      <StockDetail symbol={symbol} initialQuote={initialQuote} />
    </Suspense>
  );
}

export async function generateMetadata({ params }: Props) {
  const { symbol } = await params;
  return { title: `${symbol.toUpperCase()} — Toss Stock` };
}

import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import { StockDetail } from '@/components/stock/StockDetail';
import { getQuote } from '@/lib/yahoo';
import type { StockQuote } from '@/types/stock';

const SYMBOL_RE = /^[A-Z0-9.\-]{1,12}$/;

type Props = { params: Promise<{ symbol: string }> };

export default async function StockPage({ params }: Props) {
  const symbol = (await params).symbol.toUpperCase();

  if (!SYMBOL_RE.test(symbol)) notFound();

  let initialQuote: StockQuote;
  try {
    initialQuote = await getQuote(symbol);
  } catch {
    notFound();
  }

  return (
    <Suspense fallback={<div className="w-full h-screen bg-[#161616] animate-pulse" />}>
      <StockDetail symbol={symbol} initialQuote={initialQuote} />
    </Suspense>
  );
}

export async function generateMetadata({ params }: Props) {
  const symbol = (await params).symbol.toUpperCase();
  return { title: `${symbol} — Toss Stock` };
}

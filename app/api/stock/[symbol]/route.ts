import { NextResponse } from 'next/server';

import { getQuote } from '@/lib/yahoo';

type Params = { params: Promise<{ symbol: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { symbol } = await params;
  const data = await getQuote(symbol.toUpperCase());
  return NextResponse.json(data);
}

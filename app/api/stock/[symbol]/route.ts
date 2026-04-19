import { NextResponse } from 'next/server';

import { getQuote } from '@/lib/yahoo';

const SYMBOL_RE = /^[A-Z0-9.\-]{1,12}$/;

type Params = { params: Promise<{ symbol: string }> };

export async function GET(_req: Request, { params }: Params) {
  const symbol = (await params).symbol.toUpperCase();

  if (!SYMBOL_RE.test(symbol)) {
    return NextResponse.json({ error: 'Invalid symbol' }, { status: 400 });
  }

  const data = await getQuote(symbol);
  return NextResponse.json(data);
}

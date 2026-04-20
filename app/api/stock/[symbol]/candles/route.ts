import { NextResponse } from 'next/server';

import { getCandles } from '@/lib/yahoo';
import { PERIODS } from '@/types/stock';
import type { Period } from '@/types/stock';

const SYMBOL_RE = /^[A-Z0-9.\-]{1,12}$/;
const VALID_PERIODS = new Set<string>(PERIODS);

export const revalidate = 60;

type Params = { params: Promise<{ symbol: string }> };

export async function GET(req: Request, { params }: Params) {
  const symbol = (await params).symbol.toUpperCase();
  const { searchParams } = new URL(req.url);
  const periodParam = searchParams.get('period') ?? '1D';

  if (!SYMBOL_RE.test(symbol)) {
    return NextResponse.json({ error: 'Invalid symbol' }, { status: 400 });
  }

  if (!VALID_PERIODS.has(periodParam)) {
    return NextResponse.json({ error: 'Invalid period' }, { status: 400 });
  }

  const data = await getCandles(symbol, periodParam as Period);
  return NextResponse.json(data);
}

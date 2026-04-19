import { NextResponse } from 'next/server';

import { getCandles } from '@/lib/yahoo';
import { PERIODS } from '@/types/stock';
import type { Period } from '@/types/stock';

const VALID_PERIODS = new Set<string>(PERIODS);

type Params = { params: Promise<{ symbol: string }> };

export async function GET(req: Request, { params }: Params) {
  const { symbol } = await params;
  const { searchParams } = new URL(req.url);
  const periodParam = searchParams.get('period') ?? '1D';

  if (!VALID_PERIODS.has(periodParam)) {
    return NextResponse.json({ error: 'Invalid period' }, { status: 400 });
  }

  const data = await getCandles(symbol.toUpperCase(), periodParam as Period);
  return NextResponse.json(data);
}

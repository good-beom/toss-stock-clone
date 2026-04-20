import { NextResponse } from 'next/server';

import { getForexRate } from '@/lib/yahoo';

export const revalidate = 3_600; // 1-hour ISR cache

export async function GET() {
  const rate = await getForexRate();
  return NextResponse.json({ rate });
}

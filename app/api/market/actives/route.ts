import { NextResponse } from 'next/server';

import { getTopActives } from '@/lib/yahoo';

export async function GET() {
  const data = await getTopActives(50);
  return NextResponse.json(data);
}

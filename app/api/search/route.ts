import { NextResponse } from 'next/server';

import { searchSymbol } from '@/lib/yahoo';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q') ?? '';

  if (!query.trim()) {
    return NextResponse.json([]);
  }

  const data = await searchSymbol(query);
  return NextResponse.json(data);
}

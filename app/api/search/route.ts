import { NextResponse } from 'next/server';

import { searchSymbol } from '@/lib/yahoo';

const MAX_QUERY_LENGTH = 100;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q') ?? '';

  if (!query.trim() || query.length > MAX_QUERY_LENGTH) {
    return NextResponse.json([]);
  }

  const data = await searchSymbol(query);
  return NextResponse.json(data);
}

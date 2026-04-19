'use client';

import { useCallback, useState } from 'react';

const STORAGE_KEY = 'recent-symbols';
const MAX_RECENT = 10;

function readFromStorage(): string[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
  } catch {
    return [];
  }
}

export function useRecentSymbols() {
  const [symbols, setSymbols] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    return readFromStorage();
  });

  const addSymbol = useCallback((symbol: string) => {
    setSymbols((prev) => {
      const updated = [symbol, ...prev.filter((s) => s !== symbol)].slice(0, MAX_RECENT);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  return { symbols, addSymbol };
}

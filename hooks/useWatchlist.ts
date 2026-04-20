'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { WatchlistItem } from '@/types/stock';

interface WatchlistState {
  items: WatchlistItem[];
  add: (item: Omit<WatchlistItem, 'addedAt'>) => void;
  remove: (symbol: string) => void;
  has: (symbol: string) => boolean;
}

export const useWatchlist = create<WatchlistState>()(
  persist(
    (set, get) => ({
      items: [],
      add: ({ symbol, name }) => {
        if (get().has(symbol)) return;
        set((state) => ({
          items: [{ symbol, name, addedAt: Date.now() }, ...state.items],
        }));
      },
      remove: (symbol) =>
        set((state) => ({
          items: state.items.filter((item) => item.symbol !== symbol),
        })),
      has: (symbol) => get().items.some((item) => item.symbol === symbol),
    }),
    { name: 'watchlist', skipHydration: true },
  ),
);

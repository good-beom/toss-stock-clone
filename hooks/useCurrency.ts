'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CurrencyState {
  displayCurrency: 'USD' | 'KRW';
  toggle: () => void;
}

export const useCurrency = create<CurrencyState>()(
  persist(
    (set, get) => ({
      displayCurrency: 'USD',
      toggle: () =>
        set({ displayCurrency: get().displayCurrency === 'USD' ? 'KRW' : 'USD' }),
    }),
    { name: 'display-currency', skipHydration: true },
  ),
);

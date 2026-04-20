'use client';

import { useQuery } from '@tanstack/react-query';

import { useCurrency } from '@/hooks/useCurrency';
import { formatKRW, formatPrice } from '@/lib/format';
import { forexRateOptions } from '@/lib/queries';

export function useCurrencyDisplay() {
  const { displayCurrency, toggle } = useCurrency();
  const { data } = useQuery(forexRateOptions());
  const rate = data?.rate ?? 1_400;

  function formatDisplayPrice(price: number, originalCurrency: string): string {
    if (displayCurrency === 'KRW' && originalCurrency === 'USD') {
      return formatKRW(price * rate);
    }
    return formatPrice(price, originalCurrency);
  }

  return { displayCurrency, toggle, formatDisplayPrice, rate };
}

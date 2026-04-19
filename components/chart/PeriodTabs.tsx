'use client';

import { PERIODS } from '@/types/stock';
import type { Period } from '@/types/stock';

interface Props {
  value: Period;
  onValueChange: (period: Period) => void;
}

export function PeriodTabs({ value, onValueChange }: Props) {
  return (
    <div className="flex gap-1 px-4 py-2">
      {PERIODS.map((p) => (
        <button
          key={p}
          onClick={() => onValueChange(p)}
          className={`px-3 py-1 text-sm rounded-full transition-colors ${
            value === p
              ? 'bg-white text-black font-semibold'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          {p}
        </button>
      ))}
    </div>
  );
}

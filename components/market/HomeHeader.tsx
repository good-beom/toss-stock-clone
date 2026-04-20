'use client';

import { useLanguage } from '@/hooks/useLanguage';

export function HomeHeader() {
  const { tr } = useLanguage();
  return (
    <div className="px-4 mb-4">
      <h1 className="text-xl font-bold">{tr.home.title}</h1>
      <p className="text-xs text-zinc-500 mt-1">{tr.home.subtitle}</p>
    </div>
  );
}

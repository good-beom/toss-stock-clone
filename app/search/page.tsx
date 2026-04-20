'use client';

import { useLanguage } from '@/hooks/useLanguage';
import { StockSearchBar } from '@/components/stock/StockSearchBar';

export default function SearchPage() {
  const { tr } = useLanguage();
  return (
    <main className="flex flex-col min-h-screen bg-[#161616] text-white px-4 pt-12 pb-20">
      <h1 className="text-xl font-bold mb-6">{tr.search.title}</h1>
      <StockSearchBar />
    </main>
  );
}

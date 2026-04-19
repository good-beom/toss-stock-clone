import { StockSearchBar } from '@/components/stock/StockSearchBar';

export const metadata = { title: '종목 검색 — Toss Stock' };

export default function SearchPage() {
  return (
    <main className="flex flex-col min-h-screen bg-[#161616] text-white px-4 pt-12 pb-8">
      <h1 className="text-xl font-bold mb-6">종목 검색</h1>
      <StockSearchBar />
    </main>
  );
}

import { ActivesList } from '@/components/market/ActivesList';
import { getTopActives } from '@/lib/yahoo';

export const metadata = { title: '거래 상위 종목 — Toss Stock' };

export const revalidate = 60;

export default async function HomePage() {
  let initialData = await getTopActives(50).catch(() => []);

  return (
    <main className="flex flex-col min-h-screen bg-[#161616] text-white pt-12 pb-20">
      <div className="px-4 mb-4">
        <h1 className="text-xl font-bold">거래 상위 종목</h1>
        <p className="text-xs text-zinc-500 mt-1">미국 시장 거래량 기준 · 1분마다 업데이트</p>
      </div>
      <ActivesList initialData={initialData} />
    </main>
  );
}

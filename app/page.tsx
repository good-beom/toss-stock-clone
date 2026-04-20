import { ActivesList } from '@/components/market/ActivesList';
import { HomeHeader } from '@/components/market/HomeHeader';
import { getTopActives } from '@/lib/yahoo';

export const metadata = { title: '거래 상위 종목 — Toss Stock' };

export const revalidate = 60;

export default async function HomePage() {
  let initialData = await getTopActives(50).catch(() => []);

  return (
    <main className="flex flex-col min-h-screen bg-[#161616] text-white pt-12 pb-20">
      <HomeHeader />
      <ActivesList initialData={initialData} />
    </main>
  );
}

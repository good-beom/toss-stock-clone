'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { useLanguage } from '@/hooks/useLanguage';

const TAB_HREFS = ['/', '/watchlist'] as const;

const TAB_ICONS = {
  '/': (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  '/watchlist': (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  ),
};

export function BottomNav() {
  const pathname = usePathname();
  const { tr, lang, toggle: toggleLang } = useLanguage();

  if (pathname.startsWith('/stock/')) return null;

  const tabLabels = {
    '/': tr.nav.home,
    '/watchlist': tr.nav.watchlist,
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#1c1c1c] border-t border-zinc-800 flex items-stretch h-16">
      {TAB_HREFS.map((href) => {
        const isActive = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-1 flex-col items-center justify-center gap-1 text-xs transition-colors ${
              isActive ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {TAB_ICONS[href]}
            <span>{tabLabels[href]}</span>
          </Link>
        );
      })}

      <button
        onClick={toggleLang}
        className="flex flex-col items-center justify-center px-4 text-xs text-zinc-500 hover:text-zinc-300 transition-colors shrink-0 border-l border-zinc-800"
        aria-label="Toggle language"
      >
        <span className="font-medium text-sm leading-none">{lang === 'en' ? '한' : 'EN'}</span>
      </button>
    </nav>
  );
}

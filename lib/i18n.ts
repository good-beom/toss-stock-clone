export type Lang = 'en' | 'ko';

export const t = {
  en: {
    nav: {
      home: 'Home',
      search: 'Search',
      watchlist: 'Watchlist',
    },
    home: {
      title: 'Most Active',
      subtitle: 'US market · by volume · updated every minute',
    },
    search: {
      title: 'Search Stocks',
      placeholder: 'Search by name or ticker',
      recent: 'Recent',
      searching: 'Searching…',
      noResults: 'No results found',
    },
    watchlist: {
      title: 'Watchlist',
      empty: 'No stocks added yet',
      emptyHint: 'Tap ☆ on a stock detail page to add',
    },
    watchlistBtn: {
      add: 'Add',
      added: 'Watchlist',
      addLabel: 'Add to watchlist',
      removeLabel: 'Remove from watchlist',
    },
    stock: {
      backLabel: 'Go back',
    },
    stats: {
      high52w: '52W High',
      low52w: '52W Low',
      marketCap: 'Mkt Cap',
      pe: 'P/E',
      volume: 'Volume',
      avgVolume: 'Avg Vol',
    },
    marketState: {
      REGULAR: 'Market Open',
      PRE: 'Pre-Market',
      PREPRE: 'Pre-Market',
      POST: 'After Hours',
      POSTPOST: 'After Hours',
      CLOSED: 'Market Closed',
    },
  },
  ko: {
    nav: {
      home: '홈',
      search: '검색',
      watchlist: '관심 종목',
    },
    home: {
      title: '거래 상위 종목',
      subtitle: '미국 시장 거래량 기준 · 1분마다 업데이트',
    },
    search: {
      title: '종목 검색',
      placeholder: '종목명 또는 티커 검색',
      recent: '최근 본 종목',
      searching: '검색 중…',
      noResults: '검색 결과가 없습니다',
    },
    watchlist: {
      title: '관심 종목',
      empty: '관심 종목이 없습니다',
      emptyHint: '종목 상세 페이지에서 ☆ 버튼으로 추가하세요',
    },
    watchlistBtn: {
      add: '추가',
      added: '관심 종목',
      addLabel: '관심 종목 추가',
      removeLabel: '관심 종목 제거',
    },
    stock: {
      backLabel: '뒤로가기',
    },
    stats: {
      high52w: '52주 최고',
      low52w: '52주 최저',
      marketCap: '시가총액',
      pe: 'P/E',
      volume: '거래량',
      avgVolume: '평균 거래량',
    },
    marketState: {
      REGULAR: '정규장',
      PRE: '장전 거래',
      PREPRE: '장전 거래',
      POST: '장후 거래',
      POSTPOST: '장후 거래',
      CLOSED: '장 마감',
    },
  },
} as const;

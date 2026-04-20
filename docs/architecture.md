# Architecture

## 개요

토스 증권 앱의 종목 상세 페이지를 클론한 포트폴리오 프로젝트.
Next.js App Router 기반으로 서버/클라이언트 렌더링을 명확히 분리하고,
실시간 시세와 캔들차트를 제공한다.

## 기술 스택

| 역할 | 라이브러리 | 버전 |
|------|-----------|------|
| 프레임워크 | Next.js App Router | 16.2 |
| 언어 | TypeScript strict mode | 5.x |
| 서버 데이터 | yahoo-finance2 | 3.x |
| 서버 상태 | TanStack Query v5 | 5.x |
| 전역 클라이언트 상태 | Zustand | 5.x |
| 차트 | lightweight-charts | 5.x |
| 스타일 | Tailwind CSS | 3.x |

## 디렉토리 구조

```
app/
  layout.tsx                    # Providers 주입 + BottomNav
  page.tsx                      # 홈 — 거래 상위 50종목 (SSR + 60s ISR)
  providers.tsx                 # QueryClientProvider + LanguageProvider + Zustand rehydrate
  search/page.tsx               # 종목 검색 페이지 (Client Component)
  watchlist/page.tsx            # 관심 종목 페이지 (Client Component)
  stock/[symbol]/page.tsx       # 종목 상세 페이지 (Server Component)
  api/
    market/actives/route.ts         # GET /api/market/actives
    stock/[symbol]/route.ts         # GET /api/stock/:symbol
    stock/[symbol]/candles/route.ts # GET /api/stock/:symbol/candles?period=1D
    search/route.ts                 # GET /api/search?q=:query

components/
  BottomNav.tsx                 # 하단 탭 내비게이션 (홈·검색·관심종목) + 언어 토글
  chart/
    CandleChart.tsx             # 캔들차트 컴포넌트 ('use client', no SSR)
    PeriodTabs.tsx              # 기간 탭 선택기 ('use client')
  market/
    ActivesList.tsx             # 거래 상위 종목 리스트 (Client Component)
    HomeHeader.tsx              # 홈 페이지 제목 — 언어 반응형 (Client Component)
  stock/
    PriceHeader.tsx             # 현재가 / 등락률 표시 — 한국어 모드에서 한국어 이름 병기
    StockDetail.tsx             # 종목 상세 클라이언트 오케스트레이터 + 뒤로가기 버튼
    StockSearchBar.tsx          # 검색 입력 + 결과 목록 + 최근 본 종목
    WatchlistButton.tsx         # 관심 종목 추가·제거 토글 버튼
    WatchlistItem.tsx           # 관심 종목 목록 단일 항목 (현재가 표시)

hooks/
  useCandleChart.ts             # lightweight-charts 인스턴스 lifecycle 관리
  useLanguage.tsx               # 언어 Context + localStorage 퍼시스턴스 훅
  useRecentSymbols.ts           # localStorage 기반 최근 본 종목 이력 관리
  useStockPrice.ts              # 종목 현재가 polling 훅
  useWatchlist.ts               # Zustand + persist 관심 종목 전역 상태

lib/
  format.ts                     # formatPrice / formatVolume / priceChangeColor / priceChangeSign
  i18n.ts                       # EN/KO 번역 문자열 (as const 타입 안전)
  koreanNames.ts                # 미국 주요 종목·ETF 100+ 한국어 이름 매핑
  queries.ts                    # TanStack Query queryOptions 정의
  yahoo.ts                      # yahoo-finance2 서버 전용 래퍼

types/
  stock.ts                      # 공유 타입 + PERIODS 상수
```

## 데이터 흐름

### 홈 페이지 — 거래 상위 종목

```
[브라우저]                [Next.js 서버]             [Yahoo Finance API]
    │                         │                            │
    │  페이지 요청              │                            │
    │ ──────────────────────► │                            │
    │                         │  getTopActives(50)         │
    │                         │  (screener: most_actives)  │
    │                         │ ──────────────────────────►│
    │                         │◄────────────────────────── │
    │  HTML (초기 리스트 포함)  │                            │
    │◄──────────────────────── │                            │
    │                         │                            │
    │  GET /api/market/actives │                            │
    │ ──────────────────────► │  getTopActives()           │
    │  StockQuote[]           │ ──────────────────────────►│
    │◄──────────────────────── │◄────────────────────────── │
    │  (60초마다 반복)          │                            │
```

### 종목 상세 페이지

```
[브라우저]                [Next.js 서버]             [Yahoo Finance API]
    │                         │                            │
    │  페이지 요청              │                            │
    │ ──────────────────────► │                            │
    │                         │  getQuote(symbol)          │
    │                         │ ──────────────────────────►│
    │                         │◄────────────────────────── │
    │  HTML (초기 시세 포함)    │                            │
    │◄──────────────────────── │                            │
    │                         │                            │
    │  GET /api/stock/:symbol  │                            │
    │ ──────────────────────► │  getQuote()                │
    │  { price, change, ... } │ ──────────────────────────►│
    │◄──────────────────────── │◄────────────────────────── │
    │  (10초마다 반복)          │                            │
    │                         │                            │
    │  GET /api/.../candles    │                            │
    │ ──────────────────────► │  getCandles()              │
    │  CandleData[]           │ ──────────────────────────►│
    │◄──────────────────────── │◄────────────────────────── │
```

### 종목 검색

```
[브라우저]
    │
    │  input 입력 (즉시 반영)
    │       │
    │  useDeferredValue (렌더 블로킹 없이 쿼리 지연)
    │       │
    │  GET /api/search?q=:query
    │ ──────────────────────────► [Next.js 서버]
    │                                   │  searchSymbol()    [Yahoo Finance API]
    │                                   │ ──────────────────────────────────────►
    │                                   │◄────────────────────────────────────── 
    │  SearchResult[]                   │
    │◄────────────────────────────────── │
```

## 핵심 아키텍처 원칙

### 서버/클라이언트 경계

- **Server Component 우선**: 데이터 패칭, SEO용 초기 렌더링은 서버에서 처리
- **`'use client'` 최소화**: 상태·이벤트·브라우저 API가 필요한 곳에만 적용
- **yahoo-finance2는 서버 전용**: `lib/yahoo.ts`를 통해서만 사용하며 클라이언트에서는 절대 직접 import 금지
- **클라이언트 데이터 패칭은 Route Handler 경유**: 클라이언트가 외부 API를 직접 호출하지 않음

### 상태 관리 역할 분리

| 상태 종류 | 담당 |
|---------|------|
| 서버에서 받아온 원격 데이터 (시세, 차트, 거래 상위) | TanStack Query |
| 전역 클라이언트 상태 (관심 종목) | Zustand + persist |
| 언어 설정 | React Context + localStorage |
| 로컬 UI 상태 (선택된 기간 등) | useState |
| 최근 본 종목 | useState + localStorage (useEffect 로드) |

### SSR hydration 전략

**서버 컴포넌트 초기 데이터 → `initialData`**

홈 페이지와 종목 상세 페이지는 서버에서 데이터를 fetch해 HTML에 포함한다. 클라이언트에서는 TanStack Query의 `initialData`로 그대로 hydrate하므로 로딩 상태가 노출되지 않는다.

**Zustand persist — `skipHydration`**

`persist` 미들웨어의 기본 동작은 서버에서 `items: []`로 렌더링하고 클라이언트에서 localStorage 값으로 덮어써 hydration mismatch를 유발한다. `skipHydration: true`로 서버와 클라이언트 초기값을 동일하게 맞추고, `Providers`의 `useEffect`에서 마운트 후 한 번 `rehydrate()`를 호출한다.

```ts
// 서버·클라이언트 초기값 동일 → hydration mismatch 없음
persist(..., { name: 'watchlist', skipHydration: true })

// Providers.tsx — 마운트 후 한 번만 실행
useEffect(() => { useWatchlist.persist.rehydrate(); }, []);
```

**localStorage — `useEffect` 로드**

`useState` 초기화 함수에서 `typeof window` 분기를 쓰면 서버 `[]`와 클라이언트 localStorage 값이 달라 mismatch가 발생한다. `useRecentSymbols`와 언어 설정 모두 `useState([])` 초기화 후 `useEffect`에서 localStorage를 읽는 패턴을 사용한다.

```ts
const [symbols, setSymbols] = useState<string[]>([]);
useEffect(() => { setSymbols(readFromStorage()); }, []);
```

### 검색 UX — useDeferredValue

외부 debounce 라이브러리 없이 React 내장 `useDeferredValue`로 타이핑 중 렌더링 블로킹을 방지한다.

```
input 상태 (즉시 반영) → useDeferredValue → useQuery 실행
```

`deferredQuery`가 바뀌어야 `useQuery`가 실행되므로, 브라우저가 여유 있을 때 검색 요청을 보낸다.

### 최근 본 종목 — localStorage 퍼시스턴스

`useRecentSymbols` 훅이 `localStorage`를 직접 관리한다.

- 종목 상세 페이지 진입 시 `addSymbol(symbol)` 호출 → 심볼 저장
- 최대 10개, 중복 시 맨 앞으로 이동
- 서버 상태(TanStack Query)와 무관한 순수 클라이언트 상태이므로 Zustand 없이 `useState`로 관리

### 관심 종목 — Zustand persist

`useWatchlist`는 Zustand `persist` 미들웨어로 `localStorage` 동기화를 자동 처리한다. 여러 컴포넌트(`WatchlistButton`, `WatchlistItem`, `WatchlistPage`)에서 공유되는 전역 상태이므로 Zustand를 선택했다.

리렌더 최적화를 위해 각 컴포넌트는 필요한 슬라이스만 selector로 구독한다.

```ts
// WatchlistButton — 자신의 symbol에 해당하는 boolean만 구독
const isWatched = useWatchlist((s) => s.items.some((i) => i.symbol === symbol));

// WatchlistItem — stable 함수 참조만 구독
const remove = useWatchlist((s) => s.remove);
```

관심 종목 시세는 `WatchlistPage`에서 `watchlistQuotesOptions(symbols)`로 단일 쿼리를 생성해 `Promise.all`로 병렬 fetch한다. WatchlistItem마다 독립 쿼리를 갖는 N+1 폴링 대신 타이머 1개로 전체를 관리한다.

### 다국어 지원 — React Context

`LanguageProvider`가 언어 상태를 관리하며 `localStorage`에 설정을 저장한다. 앱 전체를 `Providers`에서 감싸므로 어느 컴포넌트에서나 `useLanguage()`로 접근할 수 있다.

```ts
const { lang, tr, toggle } = useLanguage();
// tr.search.title → "Search Stocks" (EN) | "종목 검색" (KO)
```

번역 문자열은 `lib/i18n.ts`에 `as const`로 정의해 TypeScript가 키 오탈자를 컴파일 타임에 잡는다. 한국어 종목명은 `lib/koreanNames.ts`의 정적 매핑으로 런타임 추가 요청 없이 즉시 표시된다.

### 1D 차트 — 주말·휴장일 대응

`daysBack: 1`로 조회하면 장 마감 후나 주말에 데이터가 비어 있다. 5일치를 조회한 뒤 가장 최근 거래일(`toDateString()` 비교)의 데이터만 필터링해 반환한다.

```ts
if (period === '1D' && candles.length > 0) {
  const lastDay = new Date(candles[candles.length - 1].time * 1000).toDateString();
  return candles.filter((c) => new Date(c.time * 1000).toDateString() === lastDay);
}
```

### lightweight-charts v5

v4와 달리 v5는 Series를 `SeriesDefinition` 객체로 생성한다.

```ts
// v4 (deprecated)
chart.addCandlestickSeries()

// v5
import { CandlestickSeries } from 'lightweight-charts';
chart.addSeries(CandlestickSeries, options)
```

`autoSize: true` 옵션으로 ResizeObserver를 내장 처리하며, `useEffect` cleanup에서 반드시 `chart.remove()`를 호출한다.

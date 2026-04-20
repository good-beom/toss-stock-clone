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
| 스타일 | Tailwind CSS | 4.x |

## 디렉토리 구조

```
app/
  layout.tsx                    # Providers (QueryClientProvider) 주입
  page.tsx                      # / → /search 리다이렉트
  providers.tsx                 # 'use client' — QueryClientProvider
  search/page.tsx               # 종목 검색 페이지
  watchlist/page.tsx            # 관심 종목 페이지
  stock/[symbol]/page.tsx       # 종목 상세 페이지 (Server Component)
  api/
    stock/[symbol]/route.ts         # GET /api/stock/:symbol
    stock/[symbol]/candles/route.ts # GET /api/stock/:symbol/candles?period=1D
    search/route.ts                 # GET /api/search?q=:query

components/
  chart/
    CandleChart.tsx             # 캔들차트 컴포넌트 ('use client', no SSR)
    PeriodTabs.tsx              # 기간 탭 선택기 ('use client')
  stock/
    PriceHeader.tsx             # 현재가 / 등락률 표시
    StockDetail.tsx             # 종목 상세 클라이언트 오케스트레이터
    StockSearchBar.tsx          # 검색 입력 + 결과 목록 + 최근 본 종목
    WatchlistButton.tsx         # 관심 종목 추가·제거 토글 버튼
    WatchlistItem.tsx           # 관심 종목 목록 단일 항목 (현재가 표시)

hooks/
  useCandleChart.ts             # lightweight-charts 인스턴스 lifecycle 관리
  useStockPrice.ts              # 종목 현재가 polling 훅
  useRecentSymbols.ts           # localStorage 기반 최근 본 종목 이력 관리
  useWatchlist.ts               # Zustand + persist 관심 종목 전역 상태

lib/
  yahoo.ts                      # yahoo-finance2 서버 전용 래퍼
  queries.ts                    # TanStack Query queryOptions 정의
  format.ts                     # formatPrice / priceChangeColor / priceChangeSign 공유 포맷 유틸

types/
  stock.ts                      # 공유 타입 + PERIODS 상수
```

## 데이터 흐름

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
    │                         │ ──────────────────────────►│
    │  { price, change, ... } │◄────────────────────────── │
    │◄──────────────────────── │                            │
    │  (10초마다 반복)          │                            │
    │                         │                            │
    │  GET /api/.../candles    │                            │
    │ ──────────────────────► │  getCandles()              │
    │                         │ ──────────────────────────►│
    │  CandleData[]           │◄────────────────────────── │
    │◄──────────────────────── │                            │
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
| 서버에서 받아온 원격 데이터 (시세, 차트) | TanStack Query |
| 전역 클라이언트 상태 (관심 종목 등) | Zustand |
| 로컬 UI 상태 (선택된 기간 등) | useState |

### SSR과 hydration 전략

종목 상세 페이지는 두 단계로 렌더링된다.

1. **서버**: `getQuote()`로 초기 시세를 fetch → HTML에 포함해 응답
2. **클라이언트**: TanStack Query의 `initialData`로 서버 데이터를 hydration → 이후 10초 간격으로 polling

차트(`CandleChart`)는 canvas 기반이므로 `dynamic(..., { ssr: false })`로 SSR을 비활성화하고, 데이터를 기다리는 동안 skeleton을 표시한다.

### 검색 UX — useDeferredValue

외부 debounce 라이브러리 없이 React 내장 `useDeferredValue`로 타이핑 중 렌더링 블로킹을 방지한다.

```
input 상태 (즉시 반영) → useDeferredValue → useQuery 실행
```

`deferredQuery`가 바뀌어야 `useQuery`가 실행되므로, 브라우저가 여유 있을 때 검색 요청을 보낸다.

### 최근 본 종목 — localStorage 퍼시스턴스

`useRecentSymbols` 훅이 `localStorage`를 직접 관리한다.

- 종목 상세 페이지 진입 시 `addSymbol(symbol)` 호출 → 심볼 저장
- 최대 10개, 중복 시 맨 앞으로 이동 (`[symbol, ...prev.filter(s => s !== symbol)].slice(0, 10)`)
- SSR 환경(`typeof window === 'undefined'`)에서는 빈 배열 반환 — hydration mismatch 방지
- 서버 상태(TanStack Query)와 무관한 순수 클라이언트 상태이므로 Zustand를 쓰지 않고 `useState`로 관리

### 관심 종목 — Zustand persist

`useWatchlist`는 Zustand `persist` 미들웨어로 `localStorage` 동기화를 자동 처리한다. `useRecentSymbols`와 달리 여러 컴포넌트(`WatchlistButton`, `WatchlistItem`, `WatchlistPage`)에서 공유되는 전역 상태이므로 Zustand를 선택했다.

리렌더 최적화를 위해 각 컴포넌트는 필요한 슬라이스만 selector로 구독한다.

```ts
// 자신의 symbol에 해당하는 boolean만 — 다른 종목 추가·제거 시 리렌더 없음
const isWatched = useWatchlist((s) => s.items.some((i) => i.symbol === symbol));

// stable 함수 참조 — 절대 리렌더 트리거하지 않음
const remove = useWatchlist((s) => s.remove);
```

관심 종목 시세는 `WatchlistPage`에서 `watchlistQuotesOptions(symbols)`로 단일 쿼리를 생성해 `Promise.all`로 병렬 fetch한다. WatchlistItem마다 독립 쿼리를 갖는 N+1 폴링 대신 타이머 1개로 전체를 관리한다.

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

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

hooks/
  useCandleChart.ts             # lightweight-charts 인스턴스 lifecycle 관리
  useStockPrice.ts              # 종목 현재가 polling 훅

lib/
  yahoo.ts                      # yahoo-finance2 서버 전용 래퍼
  queries.ts                    # TanStack Query queryOptions 정의

types/
  stock.ts                      # 공유 타입 + PERIODS 상수
```

## 데이터 흐름

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

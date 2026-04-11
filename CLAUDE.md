# toss-stock-clone

## Project

토스 증권 앱 종목 상세 페이지 클론 — 포트폴리오 프로젝트
Next.js 16.2 App Router + TradingView Lightweight Charts

## Package Manager

- pnpm 사용 (npm, yarn 사용 금지)
- 패키지 설치: pnpm add
- 개발 의존성: pnpm add -D
- 스크립트 실행: pnpm dev, pnpm build

## Tech Stack

- Next.js 16.2 (App Router), TypeScript strict mode
- TradingView Lightweight Charts v4 (canvas 기반)
- TanStack Query v5
- Zustand v4
- Tailwind CSS v3
- yahoo-finance2 (서버 전용 — Route Handler에서만 import)

## Code Style

- Props: `on` prefix (ex. onSymbolChange)
- Handlers: `handle` prefix (ex. handleSymbolChange)
- Nullish coalescing: `??` over `||`
- Array sort: `[...arr].sort()` — 원본 배열 변경 금지
- Commits: conventional commits in English

## Architecture Rules

- Lightweight Charts는 반드시 useRef + useEffect 패턴으로 컴포넌트 래핑
- chart 인스턴스는 반드시 useEffect cleanup에서 chart.remove() 호출
- yahoo-finance2는 반드시 lib/yahoo.ts 통해서만 사용
- 외부 데이터 fetch는 반드시 app/api/ Route Handler 경유 (클라이언트 직접 호출 금지)
- 차트 로직은 useCandleChart 커스텀 훅으로 분리

## Component Rules

- 컴포넌트 분리 기준: 재사용 or 200줄 초과 or 독립적인 복잡한 로직
- 1회성 단순 UI는 분리하지 않고 인라인 유지
- useMemo는 연산 비용이 실제로 있을 때만 사용 (단순 파생 문자열 금지)

## File Structure

app/
search/page.tsx
stock/[symbol]/page.tsx ← 핵심
watchlist/page.tsx
api/
stock/[symbol]/route.ts
stock/[symbol]/candles/route.ts
components/
chart/
CandleChart.tsx
PeriodTabs.tsx
stock/
PriceHeader.tsx
StockSearchBar.tsx
WatchlistItem.tsx
hooks/
useStockPrice.ts
useCandleChart.ts
useWatchlist.ts
lib/
yahoo.ts
types/
stock.ts

## What to AVOID

- `any` 타입
- 불필요한 컴포넌트 추상화
- yahoo-finance2 클라이언트 직접 import
- useEffect 내 차트 cleanup 누락

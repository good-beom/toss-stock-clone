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

## Refactoring Rules

코드 수정 또는 리팩토링 시 아래 기준을 항상 적용한다.

### Next.js App Router
- React Server Components 우선 — `use client`는 상태·이벤트·브라우저 API가 필요한 경우에만
- 데이터 패칭은 서버 컴포넌트에서 직접 `async/await`로 처리
- 뮤테이션은 반드시 `app/api/` Route Handler 경유 (Server Actions 사용 금지 — 프로젝트 아키텍처 원칙)

### React 패턴
- `useTransition`으로 non-blocking 상태 전환
- `useOptimistic`으로 낙관적 UI 업데이트
- `useDeferredValue`로 렌더링 우선순위 조정
- 불필요한 `useEffect` 제거 — 파생 값은 렌더 중 계산

### TypeScript
- `satisfies` 연산자로 타입 추론 유지하며 검사
- `as const`로 리터럴 타입 보존
- 유틸리티 타입 적극 활용 (`Awaited`, `ReturnType`, `Parameters` 등)

### 상태 관리
- TanStack Query v5: `queryOptions()` + `useSuspenseQuery()` 패턴
- Zustand: selector로 불필요한 리렌더 방지
- 서버 상태는 TanStack Query, 전역 클라이언트 상태는 Zustand로 분리

### 코드 품질
- 객체 복사: 스프레드 연산자 또는 `structuredClone`
- 중첩 조건 대신 early return 패턴

## What to AVOID

- `any` 타입
- 불필요한 컴포넌트 추상화
- yahoo-finance2 클라이언트 직접 import
- useEffect 내 차트 cleanup 누락

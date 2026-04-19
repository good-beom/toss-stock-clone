# Toss Stock Clone — 작업 플랜

> 최종 업데이트: 2026-04-20  
> 현재 브랜치: `feature/base-types-and-api`

---

## 현재 상태 (2026-04-20 기준)

| 항목 | 상태 |
|------|------|
| Next.js 16.2 App Router + TypeScript strict | 설정 완료 |
| 의존성 설치 (TanStack Query v5, lightweight-charts v5, Zustand v5, yahoo-finance2) | 완료 |
| ESLint / Prettier / CLAUDE.md 규칙 | 완료 |
| `types/`, `lib/`, `hooks/`, `components/` 폴더 | **없음** |
| `app/api/`, `app/search/`, `app/stock/`, `app/watchlist/` | **없음** |
| `app/page.tsx` | Next.js 기본 템플릿 상태 |

> **주의:** CLAUDE.md는 lightweight-charts v4 / Zustand v4 기준으로 쓰였지만,  
> 실제 설치 버전은 **lightweight-charts v5 / Zustand v5** — 문서와 API 참조 시 버전 주의.

---

## Phase 0 — 기반 골격 (현재 브랜치에서 완료할 것) ← **지금 여기**

현재 브랜치 `feature/base-types-and-api` 목적에 맞는 작업들.

### 0-1. 타입 정의 `types/stock.ts`

```ts
// 필요한 최소 타입
StockQuote         // 현재가, 등락률, 거래량 등
CandleData         // OHLCV + timestamp
Period             // '1D' | '1W' | '1M' | '3M' | '1Y' | '5Y'
SearchResult       // 검색 결과 아이템
WatchlistItem      // 심볼 + 이름 + 추가 시각
```

### 0-2. Yahoo 래퍼 `lib/yahoo.ts`

```ts
// 서버 전용 — 반드시 Route Handler에서만 import
getQuote(symbol: string): Promise<StockQuote>
getCandles(symbol: string, period: Period): Promise<CandleData[]>
searchSymbol(query: string): Promise<SearchResult[]>
```

### 0-3. 라우트 골격 생성 (빈 파일)

```
app/
  page.tsx                          ← 홈(→ /search 리다이렉트)
  search/page.tsx
  stock/[symbol]/page.tsx
  watchlist/page.tsx
  api/
    stock/[symbol]/route.ts
    stock/[symbol]/candles/route.ts
    search/route.ts
```

**완료 기준:** `pnpm lint` 통과, 타입/래퍼/라우트 파일 골격 존재

---

## Phase 1 — 종목 상세 MVP (최우선)

핵심 사용자 플로우의 중심. 이게 동작해야 나머지가 의미 있음.

### 1-1. Route Handlers

- [ ] `app/api/stock/[symbol]/route.ts` — `getQuote` 호출 → `StockQuote` 반환
- [ ] `app/api/stock/[symbol]/candles/route.ts` — `getCandles` 호출, `?period=1D` 쿼리 파라미터 처리

### 1-2. 차트 훅 `hooks/useCandleChart.ts`

- [ ] `useRef` + `useEffect` 패턴으로 lightweight-charts v5 인스턴스 관리
- [ ] `useEffect` cleanup에서 `chart.remove()` 필수
- [ ] period 변경 시 series 데이터만 교체 (차트 재생성 X)

### 1-3. 컴포넌트

- [ ] `components/chart/CandleChart.tsx` — `useCandleChart` 사용
- [ ] `components/chart/PeriodTabs.tsx` — `'1D' | '1W' | '1M' | '3M' | '1Y' | '5Y'` 탭
- [ ] `components/stock/PriceHeader.tsx` — 현재가, 전일 대비 등락률, 등락액

### 1-4. 페이지 `app/stock/[symbol]/page.tsx`

- [ ] Server Component에서 symbol 파라미터 받아 초기 데이터 fetch
- [ ] `<PriceHeader>` + `<PeriodTabs>` + `<CandleChart>` 조립
- [ ] Suspense boundary로 로딩 처리

**완료 기준:**
- `/stock/AAPL` 진입 시 현재가/등락률/차트 렌더
- period 탭 전환 시 데이터 갱신 정상 동작
- 차트 언마운트 시 `chart.remove()` 보장

---

## Phase 2 — 검색 플로우

- [ ] `app/api/search/route.ts` — `searchSymbol` 호출
- [ ] `components/stock/StockSearchBar.tsx` — debounce 적용 (`useDeferredValue` 활용)
- [ ] `app/search/page.tsx` — 검색 결과 렌더 + 상세 페이지 이동
- [ ] 최근 본 종목 히스토리 localStorage 저장

**완료 기준:** 검색 → 상세 이동 끊김 없이 동작, 새로고침 후 히스토리 유지

---

## Phase 3 — 관심 종목

- [ ] `hooks/useWatchlist.ts` — Zustand store + localStorage persist
- [ ] `components/stock/WatchlistItem.tsx`
- [ ] `app/watchlist/page.tsx`
- [ ] 상세/검색에서 관심종목 추가/제거 버튼 연결

**완료 기준:** 관심종목 CRUD 가능, 앱 재접속 후 상태 복원

---

## Phase 4 — UX 고도화

- [ ] 로딩(`loading.tsx`) / 에러(`error.tsx`) / 빈 상태 UI 일관화
- [ ] 실시간 polling (TanStack Query `refetchInterval`)
- [ ] 접근성 기본 점검 (키보드 포커스, aria 라벨)
- [ ] 토스 스타일 다크 테마 적용

---

## Phase 5 — 배포

- [ ] `pnpm build` 성공 확인
- [ ] Vercel 배포
- [ ] README 스크린샷 + 실행 방법 업데이트

---

## 아키텍처 체크리스트 (항상 지킬 것)

- [ ] `yahoo-finance2`는 `lib/yahoo.ts`만 통해서 사용
- [ ] 클라이언트는 `app/api/` Route Handler만 호출
- [ ] 차트 `useEffect` cleanup에 `chart.remove()` 필수
- [ ] `any` 타입 금지
- [ ] `useMemo`는 실제 비용 있을 때만 사용
- [ ] Server Component 우선, `'use client'`는 상태/이벤트/브라우저 API 필요 시만

---

## 리스크

| 리스크 | 대응 |
|--------|------|
| Yahoo Finance API 요청 제한 | Route Handler에 캐싱 헤더 + 클라이언트 stale-while-revalidate |
| lightweight-charts v5 API 변경 | 공식 마이그레이션 가이드 참조 (ISeriesApi 등 변경사항 있음) |
| Hydration mismatch (차트) | `dynamic(() => import(...), { ssr: false })` 로 감싸기 |

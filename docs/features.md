# Features

현재까지 구현된 기능과 앞으로 구현할 기능을 정리한다.

---

## 구현 완료

### 종목 검색 `/search`

종목명 또는 티커로 실시간 검색하고 결과를 클릭해 상세 페이지로 이동한다.

**구성 요소**

| 파일 | 역할 |
|------|------|
| `app/search/page.tsx` | 검색 페이지 (Server Component 래퍼) |
| `components/stock/StockSearchBar.tsx` | 검색 입력 + 결과 + 최근 본 종목 |
| `hooks/useRecentSymbols.ts` | localStorage 기반 최근 종목 이력 관리 |

**검색 debounce**

`useDeferredValue`를 사용해 입력값 변화가 UI 렌더링을 블로킹하지 않도록 처리한다.
사용자가 타이핑하는 동안 UI는 즉시 반응하고, 쿼리는 브라우저가 여유 있을 때 실행된다.

```
input 상태 (즉시 반영) → useDeferredValue → useQuery 실행
```

**최근 본 종목**

- 종목 상세 페이지 진입 시 `localStorage`에 심볼 저장
- 최대 10개, 중복 시 맨 앞으로 이동
- 검색어가 없을 때 pill 형태로 표시
- 새로고침 후에도 유지

---

### 종목 상세 페이지 `/stock/:symbol`

종목 심볼을 URL로 직접 입력하면 현재가, 등락률, 캔들차트를 확인할 수 있다.

**구성 요소**

| 컴포넌트 | 역할 |
|---------|------|
| `StockPage` (Server) | 초기 시세 서버 fetch, symbol 유효성 검증, metadata 생성 |
| `StockDetail` (Client) | 기간 상태 관리, 최근 종목 기록, 하위 컴포넌트 조립 |
| `PriceHeader` | 종목명, 현재가, 등락률/등락액 표시 |
| `PeriodTabs` | 1D / 1W / 1M / 3M / 1Y / 5Y 기간 선택 |
| `CandleChart` | OHLCV 캔들차트 렌더링 (no SSR) |

**시세 polling**

- 페이지 진입 시 서버가 초기 시세를 fetch해 HTML에 포함 → 빠른 초기 렌더
- 클라이언트에서 TanStack Query가 10초마다 `/api/stock/:symbol`을 호출해 갱신
- `initialData`로 hydration하므로 로딩 깜빡임 없음

**기간 전환**

- 기간 탭 클릭 시 `CandleChart`가 새 기간의 데이터를 fetch
- `placeholderData`로 이전 기간 차트 유지 → 데이터 교체 시 깜빡임 없음
- fetch 중에는 차트 우상단에 인디케이터 표시

**차트 색상 (한국 증권 관례)**

| 방향 | 색상 |
|------|------|
| 상승 | 빨간색 `#ef4444` |
| 하락 | 파란색 `#3b82f6` |

---

### API Route Handlers

모든 외부 데이터는 아래 Route Handler를 통해 제공된다. 클라이언트가 yahoo-finance2를 직접 호출하지 않는다.

#### `GET /api/stock/:symbol`

종목의 현재 시세를 반환한다. symbol은 `^[A-Z0-9.-]{1,12}$` 형식만 허용한다.

```json
{
  "symbol": "AAPL",
  "name": "Apple Inc.",
  "price": 270.23,
  "change": 6.83,
  "changePercent": 2.59,
  "volume": 55211089,
  "marketCap": 3971820552192,
  "currency": "USD"
}
```

#### `GET /api/stock/:symbol/candles?period=1D`

기간별 OHLCV 데이터를 반환한다. `period`가 유효하지 않으면 400을 반환한다.

| period | interval | 조회 기간 |
|--------|----------|---------|
| `1D` | 5분 | 1일 |
| `1W` | 30분 | 7일 |
| `1M` | 1일 | 30일 |
| `3M` | 1일 | 90일 |
| `1Y` | 1일 | 365일 |
| `5Y` | 1주 | 5년 |

```json
[
  { "time": 1776067200, "open": 259.26, "high": 259.48, "low": 258.43, "close": 259.38, "volume": 0 }
]
```

#### `GET /api/search?q=:query`

쿼리 문자열로 종목을 검색한다. 빈 쿼리 또는 100자 초과 시 빈 배열을 반환한다.

```json
[
  { "symbol": "AAPL", "name": "Apple Inc.", "exchange": "NMS", "type": "equity" }
]
```

---

### 관심 종목 `/watchlist`

종목 상세 페이지에서 관심 종목을 추가·제거하고, 목록 페이지에서 현재가를 실시간으로 확인한다.

**구성 요소**

| 파일 | 역할 |
|------|------|
| `hooks/useWatchlist.ts` | Zustand store + `persist` 미들웨어로 localStorage 자동 동기화 |
| `components/stock/WatchlistButton.tsx` | ☆/★ 토글 버튼 — 종목 상세 페이지에 표시 |
| `components/stock/WatchlistItem.tsx` | 종목명, 현재가, 등락률 표시 + 제거 버튼 |
| `app/watchlist/page.tsx` | 관심 종목 목록, 빈 상태 UI 포함 |
| `lib/format.ts` | `formatPrice` / `priceChangeColor` / `priceChangeSign` 공유 포맷 유틸 |

**상태 관리**

Zustand `persist` 미들웨어가 `localStorage` 직렬화/역직렬화를 자동으로 처리한다. 별도 로드 로직 없이 새로고침 후에도 상태가 유지된다.

```ts
export const useWatchlist = create<WatchlistState>()(
  persist((set, get) => ({ ... }), { name: 'watchlist' }),
);
```

**현재가 폴링 — 단일 쿼리**

WatchlistItem이 각자 `useQuery`를 갖는 N+1 패턴 대신, 페이지 레벨에서 `watchlistQuotesOptions`로 모든 심볼을 `Promise.all`로 병렬 fetch한다. 폴링 타이머가 N개가 아닌 1개만 생성된다.

```
watchlistQuotesOptions(symbols)
  → Promise.all([/api/stock/AAPL, /api/stock/TSLA, ...])
  → StockQuote[] → 각 WatchlistItem에 props로 전달
```

**리렌더 최적화**

`useWatchlist()`를 selector 없이 호출하면 관련 없는 항목의 추가·제거에도 모든 컴포넌트가 리렌더된다. 각 컴포넌트는 필요한 값만 선택한다.

```ts
// WatchlistButton — 자신의 symbol에 해당하는 boolean만 구독
const isWatched = useWatchlist((s) => s.items.some((i) => i.symbol === symbol));

// WatchlistItem — stable 함수 참조만 구독
const remove = useWatchlist((s) => s.remove);
```

---

## 구현 예정

### UX 고도화 — Phase 4

- `loading.tsx` / `error.tsx` / 빈 상태 UI 일관화
- 접근성 기본 점검 (키보드 포커스, aria 라벨)
- 토스 스타일 다크 테마 세부 조정

### 배포 — Phase 5

- `pnpm build` 성공 확인
- Vercel 배포
- README 스크린샷 업데이트

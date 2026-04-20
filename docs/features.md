# Features

현재까지 구현된 기능과 앞으로 구현할 기능을 정리한다.

---

## 구현 완료

### 홈 페이지 `/`

미국 시장 거래량 기준 상위 50종목을 실시간으로 보여준다.

**구성 요소**

| 파일 | 역할 |
|------|------|
| `app/page.tsx` | SSR 홈 페이지 — 서버에서 초기 데이터 fetch, 60초 ISR 재검증 |
| `components/market/ActivesList.tsx` | 거래 상위 종목 리스트 (랭킹 · 종목명 · 현재가 · 등락률) |
| `components/market/HomeHeader.tsx` | 페이지 제목 — 언어 설정에 따라 EN/KO 전환 |
| `app/api/market/actives/route.ts` | `GET /api/market/actives` — Yahoo Finance 스크리너 wrapping |

**데이터 전략**

서버가 `getTopActives(50)`으로 초기 데이터를 fetch해 HTML에 포함한다. 클라이언트에서는 TanStack Query가 `initialData`로 hydrate한 뒤 60초마다 폴링으로 갱신한다.

```
서버 → getTopActives() → initialData → ActivesList
클라이언트 → activesOptions() (60s 폴링) → 리스트 업데이트
```

---

### 종목 검색 `/search`

종목명 또는 티커로 실시간 검색하고 결과를 클릭해 상세 페이지로 이동한다.

**구성 요소**

| 파일 | 역할 |
|------|------|
| `app/search/page.tsx` | 검색 페이지 — 언어 설정으로 제목 전환 |
| `components/stock/StockSearchBar.tsx` | 검색 입력 + 결과 + 최근 본 종목 |
| `hooks/useRecentSymbols.ts` | localStorage 기반 최근 종목 이력 관리 |

**검색 debounce**

`useDeferredValue`를 사용해 입력값 변화가 UI 렌더링을 블로킹하지 않도록 처리한다.

```
input 상태 (즉시 반영) → useDeferredValue → useQuery 실행
```

**최근 본 종목**

- 종목 상세 페이지 진입 시 `localStorage`에 심볼 저장
- 최대 10개, 중복 시 맨 앞으로 이동
- 검색어가 없을 때 pill 형태로 표시
- 새로고침 후에도 유지

**한국어 모드 검색 결과**

한국어 모드에서는 검색 결과의 심볼 옆에 `lib/koreanNames.ts` 매핑으로 한국어 종목명을 함께 표시한다.

---

### 종목 상세 페이지 `/stock/:symbol`

종목 심볼을 URL로 직접 입력하면 현재가, 등락률, 캔들차트를 확인할 수 있다.

**구성 요소**

| 컴포넌트 | 역할 |
|---------|------|
| `StockPage` (Server) | 초기 시세 서버 fetch, symbol 유효성 검증, metadata 생성 |
| `StockDetail` (Client) | 기간 상태 관리, 뒤로가기 버튼, 최근 종목 기록, 하위 컴포넌트 조립 |
| `PriceHeader` | 종목명, 현재가, 등락률/등락액 표시 — 한국어 모드에서 한국어 이름 병기 |
| `PeriodTabs` | 1D / 1W / 1M / 3M / 1Y / 5Y 기간 선택 |
| `CandleChart` | OHLCV 캔들차트 렌더링 (no SSR) |
| `WatchlistButton` | 관심 종목 추가·제거 토글 버튼 |

**시세 polling**

- 페이지 진입 시 서버가 초기 시세를 fetch해 HTML에 포함 → 빠른 초기 렌더
- 클라이언트에서 TanStack Query가 10초마다 `/api/stock/:symbol`을 호출해 갱신
- `initialData`로 hydration하므로 로딩 깜빡임 없음

**기간 전환**

- 기간 탭 클릭 시 `CandleChart`가 새 기간의 데이터를 fetch
- `placeholderData`로 이전 기간 차트 유지 → 데이터 교체 시 깜빡임 없음

**1D 차트 처리**

`daysBack: 1`로 조회하면 주말·휴장일에 데이터가 비어 있는 문제가 있다. 5일치를 조회한 뒤 가장 최근 거래일의 데이터만 필터링해 반환한다.

```
daysBack: 5 → Yahoo Finance chart API → 마지막 거래일 날짜로 filter → CandleData[]
```

**차트 색상 (한국 증권 관례)**

| 방향 | 색상 |
|------|------|
| 상승 | 빨간색 `#ef4444` |
| 하락 | 파란색 `#3b82f6` |
| 보합 | 회색 `text-zinc-400` |

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

**상태 관리**

Zustand `persist` 미들웨어가 `localStorage` 직렬화/역직렬화를 자동으로 처리한다. SSR hydration mismatch를 방지하기 위해 `skipHydration: true`로 설정하고, `Providers`의 `useEffect`에서 마운트 후 한 번 `rehydrate()`를 호출한다.

**현재가 폴링 — 단일 쿼리**

WatchlistItem이 각자 `useQuery`를 갖는 N+1 패턴 대신, 페이지 레벨에서 `watchlistQuotesOptions`로 모든 심볼을 `Promise.all`로 병렬 fetch한다. 폴링 타이머가 N개가 아닌 1개만 생성된다.

**리렌더 최적화**

```ts
// WatchlistButton — 자신의 symbol에 해당하는 boolean만 구독
const isWatched = useWatchlist((s) => s.items.some((i) => i.symbol === symbol));

// WatchlistItem — stable 함수 참조만 구독
const remove = useWatchlist((s) => s.remove);
```

---

### 하단 내비게이션

모든 페이지(종목 상세 제외)에서 하단 탭 바로 홈 / 검색 / 관심 종목 간 이동이 가능하다.

| 탭 | 경로 |
|----|------|
| 홈 | `/` |
| 검색 | `/search` |
| 관심 종목 | `/watchlist` |

`/stock/*` 경로에서는 탭 바가 숨겨지고, 상단 뒤로가기 버튼(`router.back()`)으로 이전 페이지로 돌아간다. 탭 바 우측의 `한 ↔ EN` 버튼으로 언어를 전환한다.

---

### 다국어 지원 (EN / KO)

앱 전체 UI를 영어(기본)와 한국어로 전환할 수 있다.

**구성 요소**

| 파일 | 역할 |
|------|------|
| `lib/i18n.ts` | EN/KO 번역 문자열 정의 (`as const` 타입 안전) |
| `lib/koreanNames.ts` | 미국 주요 종목·ETF 100+ 한국어 이름 매핑 |
| `hooks/useLanguage.tsx` | React Context + localStorage 언어 설정 퍼시스턴스 |

**번역 범위**

| 영역 | 예시 |
|------|------|
| 내비게이션 탭 | Home / 홈 |
| 페이지 제목 | Search Stocks / 종목 검색 |
| 검색 placeholder | Search by name or ticker / 종목명 또는 티커 검색 |
| 빈 상태 메시지 | No stocks added yet / 관심 종목이 없습니다 |
| 버튼 텍스트 | Add · Watchlist / 추가 · 관심 종목 |

**한국어 종목명 표시 위치**

한국어 모드에서는 심볼 옆에 한국어 이름을 함께 표시한다.

- 홈 거래 상위 리스트 — 심볼 우측에 인라인 표기
- 검색 결과 — 심볼 우측에 인라인 표기
- 종목 상세 헤더 — 영문 종목명 아래 소자로 표기

---

### API Route Handlers

모든 외부 데이터는 아래 Route Handler를 통해 제공된다. 클라이언트가 yahoo-finance2를 직접 호출하지 않는다.

#### `GET /api/market/actives`

미국 시장 거래량 기준 상위 50종목을 반환한다.

```json
[
  { "symbol": "NVDA", "name": "NVIDIA Corporation", "price": 136.88, "change": 3.21, "changePercent": 2.40, "volume": 312000000, "currency": "USD" }
]
```

#### `GET /api/stock/:symbol`

종목의 현재 시세를 반환한다. symbol은 `^[A-Z0-9.\-]{1,12}$` 형식만 허용한다.

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
| `1D` | 5분 | 최근 거래일 1일 (5일 look-back 후 필터) |
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

## 구현 예정

### 배포 — Phase 5

- Vercel 배포
- README 스크린샷 업데이트

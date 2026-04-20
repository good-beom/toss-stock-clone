# Features

현재까지 구현된 기능과 앞으로 구현할 기능을 정리한다.

---

## 구현 완료

### 홈 페이지 `/`

미국 시장 거래량 기준 상위 50종목을 실시간으로 보여준다. 상단 서치바에서 바로 종목을 검색할 수 있다.

**구성 요소**

| 파일 | 역할 |
|------|------|
| `app/page.tsx` | SSR 홈 페이지 — 서버에서 초기 데이터 fetch, 60초 ISR 재검증 |
| `components/market/HomeContent.tsx` | 홈 클라이언트 오케스트레이터 — 인라인 서치바 + Most Active 리스트 + 통화 토글 버튼 |
| `components/market/ActivesList.tsx` | 거래 상위 종목 리스트 (랭킹 · 종목명 · 현재가 · 등락률) |
| `app/api/market/actives/route.ts` | `GET /api/market/actives` — Yahoo Finance 스크리너 wrapping |

**데이터 전략**

서버가 `getTopActives(50)`으로 초기 데이터를 fetch해 HTML에 포함한다. 클라이언트에서는 TanStack Query가 `initialData`로 hydrate한 뒤 60초마다 폴링으로 갱신한다.

```
서버 → getTopActives() → initialData → ActivesList
클라이언트 → activesOptions() (60s 폴링) → 리스트 업데이트
```

**인라인 검색**

서치바에 입력하면 Most Active 리스트가 검색 결과로 교체된다. 검색어를 지우면 다시 Most Active로 돌아온다. 페이지 이동 없이 한 화면에서 처리되어 토스 앱과 유사한 UX를 제공한다.

```
input 비어 있음 → Most Active 리스트 (initialData)
input 입력 중   → useDeferredValue → /api/search → 검색 결과 인라인 표시
```

**통화 토글 버튼**

서치바 우측에 `$` / `₩` 버튼을 배치한다. 탭하면 모든 화면의 가격이 즉시 전환된다. 설정은 localStorage에 저장되어 새로고침 후에도 유지된다.

---

### 종목 검색 `/search`

종목명 또는 티커로 실시간 검색하고 결과를 클릭해 상세 페이지로 이동한다. 홈 페이지에 인라인 검색이 추가된 이후로 독립 검색 페이지는 URL 직접 접근 용도로 유지된다.

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
| `StockDetail` (Client) | 기간 상태 관리, 뒤로가기 버튼, 최근 종목 기록, 방향성 그라데이션, 하위 컴포넌트 조립 |
| `PriceHeader` | 종목명, 현재가, 등락률/등락액, 마켓 상태 배지 — 한국어 모드에서 한국어 이름 병기 |
| `PeriodTabs` | 1D / 1W / 1M / 3M / 1Y / 5Y 기간 선택 |
| `CandleChart` | OHLCV 캔들차트 + 볼륨 바 + 크로스헤어 툴팁 렌더링 (no SSR) |
| `StockStats` | 52W High/Low · Mkt Cap · P/E · Volume · Avg Vol 통계 그리드 |
| `WatchlistButton` | 관심 종목 추가·제거 토글 버튼 |

**시세 polling**

- 페이지 진입 시 서버가 초기 시세를 fetch해 HTML에 포함 → 빠른 초기 렌더
- 클라이언트에서 TanStack Query가 10초마다 `/api/stock/:symbol`을 호출해 갱신
- `initialData`로 hydration하므로 로딩 깜빡임 없음

**기간 전환**

- 기간 탭 클릭 시 `CandleChart`가 새 기간의 데이터를 fetch
- `placeholderData`로 이전 기간 차트 유지 → 데이터 교체 시 깜빡임 없음

**방향성 그라데이션 배경**

페이지 상단에 등락 방향에 따라 미묘한 그라데이션을 적용한다. 시각적으로 등락 분위기를 즉시 전달한다.

| 상태 | 색상 |
|------|------|
| 상승 | `from-red-900/20` |
| 하락 | `from-blue-900/20` |
| 보합 | `from-zinc-800/20` |

**1D 차트 처리**

`daysBack: 1`로 조회하면 주말·휴장일에 데이터가 비어 있는 문제가 있다. 5일치를 조회한 뒤 가장 최근 거래일의 데이터만 필터링해 반환한다.

```
daysBack: 5 → Yahoo Finance chart API → 마지막 거래일 날짜로 filter → CandleData[]
```

**볼륨 바**

`HistogramSeries`를 별도 가격 스케일(`priceScaleId: 'volume'`)로 생성해 캔들 아래 18% 영역에 표시한다. 축 눈금은 숨기고 색상은 캔들 방향에 따라 반투명 빨강/파랑을 적용한다.

```
CandlestickSeries (기본 스케일)
HistogramSeries   (volume 스케일, scaleMargins: { top: 0.82, bottom: 0 })
```

**OHLCV 크로스헤어 툴팁**

차트 좌측 상단에 고정 오버레이로 O / H / L / C / Vol 값을 표시한다. 마우스가 차트 위에 있을 때는 크로스헤어가 가리키는 캔들 데이터를, 차트 밖에 있을 때는 가장 최근 캔들 데이터를 보여준다.

```
subscribeCrosshairMove → setTooltipData(candle) → CandleChart 오버레이 렌더링
크로스헤어 범위 밖 → tooltipData null → data[last] 폴백
```

시간 포맷은 기간에 따라 달라진다: `1D`는 `HH:MM`, 그 외는 `MMM DD`.

**마켓 상태 배지**

`PriceHeader`에 종목명 옆에 색상 점 + 텍스트 레이블로 현재 거래 세션을 표시한다.

| 상태 | 색상 |
|------|------|
| REGULAR (정규장) | 초록 `green-500` |
| PRE / PREPRE (장전) | 노랑 `yellow-400` |
| POST / POSTPOST (장후) | 주황 `orange-400` |
| CLOSED (마감) | 회색 `zinc-500` |

**종목 통계 (`StockStats`)**

기간 탭 아래에 6가지 통계를 2열 리스트로 표시한다. 값이 Yahoo Finance 응답에 없으면 `—`으로 표시한다.

| 항목 | EN | KO |
|------|----|----|
| 52주 최고가 | 52W High | 52주 최고 |
| 52주 최저가 | 52W Low | 52주 최저 |
| 시가총액 | Mkt Cap | 시가총액 |
| 주가수익비율 | P/E | P/E |
| 거래량 | Volume | 거래량 |
| 평균 거래량 | Avg Vol | 평균 거래량 |

시가총액은 `formatMarketCap`으로 T/B/M 단위로 축약 표기한다.

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
| `components/stock/WatchlistItem.tsx` | 종목명, 현재가(통화 변환 적용), 등락률 표시 + 제거 버튼 |
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

### USD ↔ KRW 통화 전환

앱 전체 가격 표시를 미국 달러(기본)와 한국 원화로 즉시 전환할 수 있다.

**구성 요소**

| 파일 | 역할 |
|------|------|
| `hooks/useCurrency.ts` | Zustand store — `displayCurrency: 'USD' \| 'KRW'`, localStorage persist |
| `hooks/useCurrencyDisplay.ts` | 환율 쿼리 + 통화 변환 + 포맷을 하나의 훅으로 통합 |
| `lib/format.ts` | `formatKRW` — ₩ 접두사 + 한국식 천 단위 구분 |
| `app/api/forex/rate/route.ts` | `GET /api/forex/rate` — USDKRW=X 실시간 환율, 1시간 ISR 캐시 |

**환율 데이터**

Yahoo Finance의 `USDKRW=X` 환율 종목을 조회한다. 별도 유료 API 없이 yahoo-finance2를 재사용한다. 서버에서 1시간 ISR 캐시로 제공하며 클라이언트는 1시간마다 갱신한다.

```
GET /api/forex/rate → { rate: 1380.5 }
staleTime: 3600000 (1시간)
```

**적용 범위**

`useCurrencyDisplay` 훅의 `formatDisplayPrice(price, originalCurrency)`를 호출하는 모든 컴포넌트에서 즉시 전환된다.

| 컴포넌트 | 적용 필드 |
|---------|---------|
| `ActivesList` | 종목 현재가 |
| `PriceHeader` | 종목 상세 현재가 |
| `StockStats` | 52W High / 52W Low |
| `WatchlistItem` | 관심 종목 현재가 |

**토글 버튼 위치**

홈 페이지 서치바 우측에 `$USD` / `₩KRW` 버튼을 배치한다. 설정은 Zustand `persist`로 localStorage에 저장되어 새로고침 후에도 유지된다.

```
[🔍 Search stocks...]  [$  ]
                       [USD]
```

---

### 하단 내비게이션

모든 페이지(종목 상세 제외)에서 하단 탭 바로 홈 / 관심 종목 간 이동이 가능하다.

| 탭 | 경로 |
|----|------|
| 홈 | `/` |
| 관심 종목 | `/watchlist` |

`/stock/*` 경로에서는 탭 바가 숨겨지고, 상단 뒤로가기 버튼(`router.back()`)으로 이전 페이지로 돌아간다. 탭 바 우측의 `한 ↔ EN` 버튼으로 언어를 전환한다. 검색 탭은 홈 인라인 서치로 대체되어 제거됐다.

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
| 종목 통계 레이블 | 52W High / 52주 최고 |
| 마켓 상태 | Market Open / 정규장 |

**한국어 종목명 표시 위치**

한국어 모드에서는 심볼 옆에 한국어 이름을 함께 표시한다.

- 홈 거래 상위 리스트 — 심볼 우측에 인라인 표기
- 홈 인라인 검색 결과 — 심볼 우측에 인라인 표기
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

종목의 현재 시세와 상세 통계를 반환한다. symbol은 `^[A-Z0-9.\-]{1,12}$` 형식만 허용한다.

```json
{
  "symbol": "AAPL",
  "name": "Apple Inc.",
  "price": 270.23,
  "change": 6.83,
  "changePercent": 2.59,
  "volume": 55211089,
  "marketCap": 3971820552192,
  "currency": "USD",
  "marketState": "REGULAR",
  "fiftyTwoWeekHigh": 260.10,
  "fiftyTwoWeekLow": 164.08,
  "trailingPE": 33.45,
  "averageVolume": 58000000
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

#### `GET /api/forex/rate`

USDKRW 실시간 환율을 반환한다. 서버에서 1시간 ISR 캐시로 제공한다.

```json
{ "rate": 1380.5 }
```

---

## 구현 예정

### 배포 — Phase 5

- Vercel 배포
- README 스크린샷 업데이트

# Features

현재까지 구현된 기능과 앞으로 구현할 기능을 정리한다.

---

## 구현 완료

### 종목 상세 페이지 `/stock/:symbol`

종목 심볼을 URL로 직접 입력하면 현재가, 등락률, 캔들차트를 확인할 수 있다.

**구성 요소**

| 컴포넌트 | 역할 |
|---------|------|
| `StockPage` (Server) | 초기 시세 서버 fetch, metadata 생성 |
| `StockDetail` (Client) | 기간 상태 관리, 하위 컴포넌트 조립 |
| `PriceHeader` | 종목명, 현재가, 등락률/등락액 표시 |
| `PeriodTabs` | 1D / 1W / 1M / 3M / 1Y / 5Y 기간 선택 |
| `CandleChart` | OHLCV 캔들차트 렌더링 |

**시세 polling**

- 페이지 진입 시 서버가 초기 시세를 fetch해 HTML에 포함
- 클라이언트에서 TanStack Query가 10초마다 `/api/stock/:symbol`을 호출해 시세를 갱신
- 가격이 바뀌면 `PriceHeader`가 즉시 업데이트됨

**기간 전환**

- 기간 탭 클릭 시 `CandleChart`가 새 기간의 데이터를 fetch
- 데이터를 가져오는 동안 이전 기간의 차트를 유지 (`placeholderData`)
- fetch 중에는 차트 우상단에 작은 점이 깜박여 로딩 상태를 표시

**차트 색상 (한국 증권 관례)**

| 방향 | 색상 |
|------|------|
| 상승 | 빨간색 `#ef4444` |
| 하락 | 파란색 `#3b82f6` |

---

### API Route Handlers

모든 외부 데이터는 아래 Route Handler를 통해 제공된다. 클라이언트가 yahoo-finance2를 직접 호출하지 않는다.

#### `GET /api/stock/:symbol`

종목의 현재 시세를 반환한다.

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

쿼리 문자열로 종목을 검색한다. 빈 쿼리는 빈 배열을 반환한다.

```json
[
  { "symbol": "AAPL", "name": "Apple Inc.", "exchange": "NMS", "type": "equity" }
]
```

---

## 구현 예정

### 검색 `/search` — Phase 2

- 종목명 또는 티커로 실시간 검색 (`/api/search?q=` 활용)
- `useDeferredValue`로 입력 debounce
- 검색 결과 클릭 → 종목 상세 페이지 이동
- 최근 본 종목 히스토리 (`localStorage` 저장)

### 관심 종목 `/watchlist` — Phase 3

- 종목 상세/검색에서 관심 종목 추가·제거
- Zustand store + `localStorage` persist로 새로고침 후에도 유지
- 관심 종목 목록 페이지에서 각 종목의 현재가 표시

### UX 고도화 — Phase 4

- 로딩(`loading.tsx`) / 에러(`error.tsx`) / 빈 상태 UI 일관화
- 실시간 polling 재시도 정책 튜닝
- 접근성 기본 점검 (키보드 포커스, aria 라벨)
- 토스 스타일 다크 테마 세부 조정

### 배포 — Phase 5

- `pnpm build` 성공 확인
- Vercel 배포
- README 스크린샷 업데이트

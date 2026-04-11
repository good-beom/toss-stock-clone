# Toss Stock Clone

토스 증권 앱의 종목 상세 페이지를 클론한 포트폴리오 프로젝트입니다.

## Overview

실시간 주식 데이터를 기반으로 한 인터랙티브 차트와 종목 정보를 제공합니다.
TradingView Lightweight Charts를 활용한 캔들스틱/라인 차트, 기간별 데이터 조회,
관심 종목 관리 기능을 포함합니다.

## Demo

> 배포 URL 추가 예정

| 종목 검색          | 종목 상세          | 관심 종목          |
| ------------------ | ------------------ | ------------------ |
| 스크린샷 추가 예정 | 스크린샷 추가 예정 | 스크린샷 추가 예정 |

## Tech Stack

| Category        | Tech                              |
| --------------- | --------------------------------- |
| Framework       | Next.js 16.2 (App Router)         |
| Language        | TypeScript 5 (strict)             |
| Chart           | TradingView Lightweight Charts v4 |
| Server State    | TanStack Query v5                 |
| Client State    | Zustand v4                        |
| Styling         | Tailwind CSS v3                   |
| Data            | yahoo-finance2                    |
| Package Manager | pnpm                              |

## Key Features

- **실시간 시세** — 5초 폴링 기반 현재가 + 등락률 업데이트
- **인터랙티브 차트** — 캔들스틱 / 라인 차트 전환, 기간 탭 (1D / 1W / 1M / 3M / 1Y)
- **종목 검색** — 심볼 검색 + 최근 본 종목 히스토리
- **관심 종목** — 로컬 스토리지 기반 영구 저장, 미니 스파크라인

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+

### Installation

\`\`\`bash
git clone https://github.com/{username}/toss-stock-clone.git
cd toss-stock-clone
pnpm install
pnpm dev
\`\`\`

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

### Available Scripts

\`\`\`bash
pnpm dev # 개발 서버 실행
pnpm build # 프로덕션 빌드
pnpm lint # ESLint 실행
\`\`\`

## Project Structure

\`\`\`
toss-stock-clone/
├── app/
│ ├── search/ # 종목 검색 페이지
│ ├── stock/[symbol]/ # 종목 상세 페이지 (핵심)
│ ├── watchlist/ # 관심 종목 페이지
│ └── api/
│ └── stock/[symbol]/ # Route Handler (yahoo-finance2)
├── components/
│ ├── chart/ # CandleChart, PeriodTabs
│ └── stock/ # PriceHeader, StockSearchBar
├── hooks/ # useStockPrice, useCandleChart, useWatchlist
├── lib/ # yahoo.ts (외부 API 래퍼)
└── types/ # 공통 타입 정의
\`\`\`

## Architecture Decisions

**왜 Lightweight Charts인가**
ECharts 대비 번들 크기가 약 45KB로 훨씬 작고, 금융 데이터 특화 기능
(캔들스틱, OHLCV, 실시간 업데이트)이 네이티브로 지원됩니다.
실제 금융 앱(토스 포함)에서 널리 사용되는 스택을 경험하는 것이 목적입니다.

**왜 yahoo-finance2인가**
API 키 없이 즉시 사용 가능하고, 한국 주식(005930.KS)을 포함한
다양한 종목의 OHLCV 히스토리와 실시간 시세를 무료로 제공합니다.
클라이언트 노출을 막기 위해 Next.js Route Handler 내부에서만 호출합니다.

**왜 TanStack Query + Zustand인가**
서버 상태(API 데이터)와 클라이언트 상태(관심 종목, UI 상태)를
명확하게 분리하기 위해 역할에 맞는 도구를 각각 사용했습니다.

## Roadmap

- [x] 프로젝트 초기 셋업
- [ ] 종목 상세 페이지 (차트 + 현재가)
- [ ] 종목 검색
- [ ] 관심 종목
- [ ] 다크모드 대응
- [ ] Vercel 배포

## License

MIT

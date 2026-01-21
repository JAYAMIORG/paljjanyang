# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**팔자냥 (Paljjanyang)** - $1 사주 (Korean fortune-telling) 모바일 웹 서비스

### Core Features
| 기능 | 설명 |
|------|------|
| 개인 사주 | 사주팔자 + 대운 기반 인생 전체 분석 |
| 신년운세 | 세운 + 월운 기반 올해 월별 운세 |
| 궁합 | 두 사람의 사주 궁합 분석 |
| 연애운 | 연애/결혼 관련 운세 |

## Tech Stack

- **Frontend**: Next.js 14+, TypeScript, TailwindCSS
- **Backend**: Next.js API Routes (단일 프로젝트)
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth (카카오, 구글)
- **Payment**: 토스페이먼츠
- **Saju Calculation**: `lunar-typescript` (npm)
- **AI**: Claude API (LLM 해석)
- **Hosting**: Vercel

## Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

## Project Structure

```
bazi/
├── CLAUDE.md                 # This file
├── docs/
│   ├── PRD.md               # Product requirements
│   ├── Checklist.md         # Development checklist
│   ├── wireframe.md         # UI wireframes
│   ├── db_schema.md         # Database schema
│   ├── api_spec.md          # API specification
│   ├── llm_prompts.md       # LLM prompt templates
│   └── research/
│       ├── competitor_analysis.md
│       └── saju_library_research.md
├── src/                     # (planned)
│   ├── app/                 # Next.js App Router
│   ├── components/          # React components
│   ├── lib/
│   │   └── saju/           # Saju calculation utilities
│   └── types/              # TypeScript types
└── examples/
    └── saju_example.py      # Legacy Python examples
```

## Saju Calculation (lunar-typescript)

`lunar-typescript`는 `lunar-python`과 100% 동일한 기능을 제공하는 TypeScript 버전입니다 (동일 개발자 6tail).

### 주요 기능
- 사주팔자 (八字): 년주/월주/일주/시주
- 오행 (五行): 금/목/수/화/토 비율
- 십신 (十神): 비견, 정재, 정관 등
- 대운 (大運): 10년 단위 운세
- 세운 (流年): 매년 운세
- 월운 (流月): 매월 운세
- 음력/양력 변환
- 절기

## API Structure

모든 API는 Next.js API Routes로 구현 (`/app/api/`).

### 사주 분석
- `POST /api/saju/calculate` - 사주팔자 계산
- `POST /api/saju/interpret` - LLM 해석
- `POST /api/saju/save` - 결과 저장
- `GET /api/saju/history` - 조회 기록
- `DELETE /api/saju/history/[id]` - 기록 삭제
- `POST /api/saju/use-coin` - 코인 차감

### 인물 정보
- `GET /api/persons` - 인물 목록 조회
- `POST /api/persons` - 인물 저장

### 코인/결제
- `GET /api/coin/balance` - 코인 잔액
- `GET /api/coin/packages` - 패키지 목록
- `POST /api/payment/initiate` - 결제 시작
- `POST /api/payment/confirm` - 결제 확인

## Coding Conventions

### TypeScript/React
- Components: PascalCase (`SajuTypeCard.tsx`)
- Hooks: camelCase with `use` prefix (`useSajuCalculation.ts`)
- Types/Interfaces: PascalCase (`SajuResult`, `PersonInfo`)
- Constants: UPPER_SNAKE_CASE (`SAJU_TYPES`, `COIN_PACKAGES`)
- Files: kebab-case or PascalCase for components

### Directory Structure
- `/app` - Next.js App Router pages
- `/components` - Reusable React components
- `/lib` - Utility functions and business logic
- `/types` - TypeScript type definitions
- `/hooks` - Custom React hooks

## Database (Supabase)

주요 테이블:
- `profiles` - 사용자 프로필
- `persons` - 저장된 인물 정보 (생년월일 등)
- `readings` - 사주 분석 결과
- `coin_balances` - 코인 잔액
- `coin_transactions` - 코인 거래 내역
- `payments` - 결제 내역

## Branding Guidelines

- **Tone**: 친근함 (friendly), 진지함 when needed
- **Target**: MZ세대 (20-30대 여성)
- **Style**: 미니멀 + 동양적
- **Avoid**: 가부장적 표현, 구시대적 표현

## Key Documents

| 문서 | 설명 |
|------|------|
| `docs/PRD.md` | 제품 요구사항 정의 |
| `docs/Checklist.md` | 개발 체크리스트 (진행 상황) |
| `docs/wireframe.md` | UI/UX 화면 설계 |
| `docs/design_system.md` | 디자인 시스템 & 가이드라인 (색상, 타이포그래피, 컴포넌트, 애니메이션) |
| `docs/DESIGN_SUMMARY.md` | 디자인 요약본 (최종 요약, 구현 로드맵) |
| `docs/tailwind_implementation.md` | TailwindCSS 구현 가이드 (Next.js 환경) |
| `docs/db_schema.md` | 데이터베이스 스키마 |
| `docs/api_spec.md` | API 명세서 |
| `docs/llm_prompts.md` | LLM 프롬프트 템플릿 (4가지 사주 유형) |
| `docs/research/competitor_analysis.md` | 경쟁사 분석 (포스텔러, 점신, 헬로우봇 등) |

## Environment Variables (Required)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Payment (토스페이먼츠)
TOSS_CLIENT_KEY=
TOSS_SECRET_KEY=

# AI (Claude)
ANTHROPIC_API_KEY=

# Kakao (공유 기능)
NEXT_PUBLIC_KAKAO_JS_KEY=
```

## Custom Agents (Claude Code 전용)

다음 키워드가 포함된 요청 시 해당 스크립트를 자동 실행합니다.

### Design QA Agent
**트리거**: "design qa", "디자인 qa", "디자인 검사", "UI 검사", "오버플로우 검사"

UI 품질을 자동으로 검사합니다:
- 오버플로우 감지 (텍스트/요소가 컨테이너를 벗어남)
- 텍스트 잘림 확인
- 이미지 로딩 실패 감지
- 모바일 터치 타겟 크기 검사 (권장 44x44px)
- 가로 스크롤바 이상 감지

```bash
# 기본 실행
npm run design-qa

# 스크린샷 포함
npm run design-qa:screenshot

# 특정 URL 검사
node scripts/design-qa.js --url=https://bazi-azure.vercel.app

# 상세 로그
node scripts/design-qa.js --verbose
```

### Load Test Agent
**트리거**: "load test", "부하 테스트", "성능 테스트", "stress test"

서버 부하 테스트를 실행합니다:

```bash
# 기본 실행 (10 동시, 100 총 요청)
npm run load-test

# 커스텀 설정
node scripts/load-test.js --concurrent=50 --total=500 --url=https://bazi-azure.vercel.app
```

### System Status Check
**트리거**: "시스템 상태", "system status", "서버 상태"

```bash
# 로컬
curl http://localhost:3000/api/admin/status

# 프로덕션
curl https://bazi-azure.vercel.app/api/admin/status
```

### Cache Stats Check
**트리거**: "캐시 상태", "cache stats", "캐시 통계"

```bash
# 로컬
curl http://localhost:3000/api/admin/cache-stats

# 프로덕션
curl https://bazi-azure.vercel.app/api/admin/cache-stats
```

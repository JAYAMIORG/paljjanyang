# 팔자냥 개발 체크리스트

> 작성일: 2025-01-15
> 최종 업데이트: 2026-01-23
> 상태: MVP 개발 완료 (실결제 테스트 완료)

---

## 기능 우선순위

| 우선순위 | 기능 | 설명 | 상태 |
|----------|------|------|------|
| P0 | 개인 사주 | 사주팔자 + 인생 전체 분석 | **완료** |
| P0 | 신년운세 | 세운 + 월운 기반 올해 월별 운세 | **완료** |
| P0 | 궁합 | 두 사람의 사주 궁합 분석 | **완료** |
| P0 | 연애운 | 연애/결혼 관련 운세 | **완료** |
| P0 | 만세력 미리보기 | 결제 전 사주팔자 무료 확인 | **완료** |
| P0 | 사주 정보 저장 | 입력한 사주 정보 저장/재사용 | **완료** |
| P0 | 인스타 공유 | 결과 카드 이미지 공유 | **완료** |
| P2 | 오늘의 운세 | 무료, 일일 재방문 유도 | **완료** |
| P2 | 구독 모델 | 월간 구독 | 대기 |
| P2 | 푸시 알림 | 운세 알림 | 대기 |

---

## Phase 1: MVP (v1.0)

### 프로젝트 셋업
- [x] Next.js 프로젝트 생성 ✅ (2025-01-16)
- [x] lunar-typescript 설치 및 연동 ✅ (2025-01-16)
- [x] TailwindCSS v4 디자인 시스템 설정 ✅ (2025-01-16)
- [x] Supabase 클라이언트 및 타입 설정 ✅ (2025-01-16)
- [x] DB 스키마 SQL 마이그레이션 파일 작성 ✅ (2025-01-16)
- [x] Supabase 프로젝트 생성 및 스키마 적용 ✅ (2025-01-16)
- [x] 환경 변수 설정 (OpenAI, Supabase) ✅ (2025-01-16)
- [x] Vercel 배포 설정 ✅ (2025-01-16) - https://bazi-azure.vercel.app
- [x] GitHub 저장소 생성 ✅ (2025-01-16) - https://github.com/JAYAMIORG/paljjanyang

### 인증
- [x] Supabase Auth 연동 ✅ (2025-01-16)
- [x] 회원가입 페이지 ✅ (2025-01-16)
- [x] 로그인 페이지 ✅ (2025-01-16)
- [x] 이메일 로그인/회원가입 ✅ (2025-01-16)
- [x] 카카오 로그인 ✅ (2025-01-16)
- [x] 구글 로그인 ✅ (2025-01-16)

### 사주 계산 엔진 (TypeScript)
- [x] lunar-typescript 사주팔자 계산 구현 ✅ (2025-01-16)
- [x] 오행 분석 로직 구현 ✅ (2025-01-16)
- [x] 십신 계산 로직 구현 ✅ (2025-01-16)
- [x] 대운 계산 로직 구현 ✅ (2025-01-16)
- [x] 사주팔자 API Route 생성 ✅ (POST /api/saju/calculate)
- [x] 궁합 계산 API Route 생성 ✅ (2025-01-21) - interpret API에서 처리

### LLM 해석
- [x] 프롬프트 설계 (개인 사주)
- [x] 프롬프트 설계 (신년운세)
- [x] 프롬프트 설계 (궁합)
- [x] 프롬프트 설계 (연애운)
- [x] LLM API 연동 (OpenAI GPT-4o-mini) ✅ (2025-01-16)

### 코인 시스템
- [x] 코인 잔액 관리 API ✅ (2025-01-16)
- [x] 코인 패키지 목록 API ✅ (2025-01-16)
- [x] 코인 충전 페이지 ✅ (2025-01-16)
- [x] 코인 차감 API (/api/saju/use-coin) ✅ (2025-01-16)

### 결제
- [x] 토스페이먼츠 SDK 연동 ✅ (2025-01-16)
- [x] 코인 충전 플로우 UI ✅ (2025-01-16)
- [x] 결제 성공/실패 페이지 ✅ (2025-01-16)
- [x] 토스페이먼츠 실결제 테스트 ✅ (2026-01-21)
- [x] 카카오페이 연동 ✅ (2025-01-20)
  - Ready API 구현 (/api/payment/kakaopay/ready)
  - Approve API 구현 (/api/payment/kakaopay/approve)
  - 코인 충전 페이지에 결제 수단 선택 UI 추가
- [x] 결제 버그 수정 ✅ (2026-01-21)
  - RPC fallback 조건 확장 (enum 에러 처리)
  - Vercel URL 자동 감지 (localhost 리다이렉트 문제 해결)
  - 카카오페이 테스트 모드 로직 일치 (ready/approve)

### 사주 정보 저장
- [x] 인물 정보 저장 API (POST /api/persons) ✅ (2025-01-16)
- [x] 저장된 인물 목록 조회 API (GET /api/persons) ✅ (2025-01-16)
- [x] 사주 입력 페이지 플로우 개선 ✅ (2025-01-16)
  - 저장된 정보 없으면 → 바로 입력 폼
  - 저장된 정보 있으면 → 목록에서 선택 또는 새로 입력
- [x] 궁합용 2인 선택 UI ✅ (2025-01-16)
- [x] 사주 기록 삭제 API (DELETE /api/saju/history/[id]) ✅ (2025-01-16)
- [x] 궁합 계산 API 및 프롬프트 ✅ (2025-01-21)
  - 두 사람의 사주 정보를 받아서 궁합 분석
  - interpret API에서 궁합 타입 처리

### 화면 개발
- [x] 랜딩 페이지 ✅ (2025-01-16)
- [x] 홈 페이지 (사주 유형 선택) ✅ (2025-01-16)
- [x] 정보 입력 페이지 (저장/선택 기능 포함) ✅ (2025-01-16)
- [x] 만세력 미리보기 페이지 (결제 유도) ✅ (2025-01-16)
- [x] 결과 페이지 (개인 사주) ✅ (2025-01-16)
- [x] 마이페이지 (과거 기록, 코인 잔액) ✅ (2025-01-16)
- [x] 코인 충전 페이지 ✅ (2025-01-16)
- [x] 결제 성공/실패 페이지 ✅ (2025-01-16)
- [x] 결과 페이지 (신년운세 - 월별) ✅ (2025-01-21)
  - 월별 운세 그리드 표시 (점수별 색상)
  - 카테고리별 운세 (재물/연애/직장/건강)
  - 행운의 달 / 주의할 달 하이라이트

### 공유 기능
- [x] 카카오톡 공유 기능 ✅ (2025-01-20)
  - 카카오 SDK 연동 완료
  - 공유 링크로 결과 조회 가능 (/saju/shared/[id])
  - 모바일에서만 동작 (데스크톱은 링크 복사 안내)
- [x] 공유용 결과 페이지 ✅ (2025-01-20)
  - /api/saju/shared/[id] - 공개 조회 API (RLS 우회)
  - /saju/shared/[id] - 로그인 없이 결과 확인 가능
  - 원본 결과 페이지와 동일한 형태로 표시
- [x] 결과 카드 이미지 생성 ✅ (2025-01-20)
  - html2canvas로 공유 카드 이미지 생성
  - 전체 해석 내용 포함 (모든 섹션)
- [x] 인스타 공유 버튼 ✅ (2025-01-20)
  - Web Share API + 이미지 생성 구현
  - 전체 해석 내용이 포함된 이미지 공유
  - 데스크톱에서는 이미지 다운로드 후 수동 업로드
- [x] 새로고침 시 결과 캐싱 ✅ (2025-01-20)
  - 결과 저장 후 URL에 id 파라미터 추가
  - 새로고침 시 저장된 결과 불러오기 (코인 재차감 방지)
- [x] 공유 리워드 로직 ✅ (2025-01-20)
  - 공유 시 1코인 적립 (최초 1회 한정)
  - profiles 테이블에서 share_reward_claimed로 관리 (성능 최적화)
  - 이미 받은 경우 "친구에게 결과를 공유해보세요" 문구 표시

---

## Phase 2: 개선 (v1.1)

- [x] 카카오페이 추가 ✅ (2025-01-20)
- [x] 오늘의 운세 ✅ (2025-01-21)
  - 홈 화면에 무료 버튼 추가
  - 하루 1회 제한 API 구현
  - 간소화된 결과 페이지
- [x] 성능 최적화 ✅ (2026-01-21)
  - YearlyResultContent, CompatibilityResultContent 마크다운 파싱 memoize
  - Kakao SDK 중복 로딩 방지
- [x] 버그 수정 ✅ (2026-01-21)
  - Modal overflow 메모리 누수 수정
  - Timer cleanup 추가 (메모리 누수 방지)
- [x] UI 개선 ✅ (2026-01-21)
  - 마이페이지 카드 너비 및 패딩 조정 (flex flex-col 적용)
  - Card 컴포넌트 w-full 추가
- [x] 코드 정리 및 컴포넌트화 ✅ (2026-01-21)
  - Icons.tsx: 공통 아이콘 컴포넌트
  - constants.ts: 사주 관련 상수
  - markdown.ts: 마크다운 파싱 유틸리티
  - InterpretationCard, FallbackInterpretation 공유 컴포넌트
- [x] 결제 실패 시 재시도 옵션 ✅ (2026-01-21)
  - 실패 페이지에서 선택했던 패키지 정보 표시
  - "다시 결제하기" 버튼으로 같은 패키지 재시도
  - 코인 페이지에서 selected 파라미터로 패키지 자동 선택
- [x] LLM 해석 결과 캐싱 시스템 ✅ (2026-01-21)
  - 동일 생년월일/성별/시간대/사주타입 → 캐시된 결과 반환
  - interpretation_cache 테이블 설계 (cache_key, interpretation, hit_count)
  - 시간대는 12시진(時辰) 범위로 그룹화 (bazi.hour 사용)
  - 캐시 히트 시 LLM 호출 스킵 → 비용 절감
  - 캐시 통계 API (/api/admin/cache-stats)
- [x] 동시 접속 1000명 대응 (스케일링) ✅ (2026-01-21)
  - OpenAI 레이트 리미터 구현 (동시 50개 제한, 자동 재시도)
  - Supabase Admin 클라이언트 싱글톤화 (커넥션 재사용)
  - OpenAI 클라이언트 싱글톤화 (커넥션 재사용)
  - 시스템 상태 API (/api/admin/status)
  - 부하 테스트 스크립트 (scripts/load-test.js)
- [ ] 푸시 알림

---

## Phase 3: 확장 (v2.0)

- [ ] 영어 지원 (미국 시장)
- [ ] 구독 모델 구현
- [ ] 힌디어 지원 (인도 시장)
- [ ] 추가 사주 유형

---

## 문서 작업

- [x] PRD 작성
- [x] 경쟁사 분석
- [x] 사주 라이브러리 조사
- [x] 와이어프레임/화면 설계
- [x] DB 스키마 설계
- [x] LLM 프롬프트 설계
- [x] API 명세서

## 개발 준비

- [x] Python 사주 라이브러리 조사 (lunar_python 기능 확인)
- [x] TypeScript 라이브러리 조사 ✅ (lunar-typescript = lunar_python 100% 동일)
- [x] 기술 스택 비용 비교 분석 ✅ (Next.js + Supabase + Vercel 확정)
- [x] 프로젝트 초기 셋업 (Next.js + lunar-typescript) ✅ (2025-01-16)
- [x] 경쟁사/트렌드 UI/UX 분석 ✅ (2025-01-16)
- [x] 디자인 시스템 문서화 ✅ (design_system.md, DESIGN_SUMMARY.md)

---

## 구현된 컴포넌트 (2025-01-16)

### UI 컴포넌트 (`src/components/ui/`)
- [x] Button (primary, secondary, ghost variants)
- [x] Input (라벨, 에러, 힌트 지원)
- [x] Select (드롭다운)
- [x] Card (default, highlighted variants)
- [x] Feedback (LoadingScreen, ErrorScreen, EmptyState, Toast, Skeleton 등)
- [x] Modal (Modal, ConfirmDialog, AlertDialog)
- [x] Icons (Back, Close, Chevron, Trash, Link, Instagram, Kakao) ✅ NEW

### 레이아웃 컴포넌트 (`src/components/layout/`)
- [x] Header (로고, 뒤로가기, 로그인 상태)
- [x] Footer (사업자 정보, 이용약관/개인정보/환불정책 링크) ✅ NEW

### Supabase (`src/lib/supabase/`)
- [x] client.ts (브라우저 클라이언트)
- [x] server.ts (서버 클라이언트)
- [x] middleware.ts (세션 갱신)
- [x] admin.ts (Service Role 클라이언트 - RLS 우회용)

### LLM (`src/lib/llm/`)
- [x] prompts.ts (시스템 프롬프트, 사주 유형별 프롬프트)
- [x] rate-limiter.ts (OpenAI API 레이트 리미터) ✅ NEW

### Saju (`src/lib/saju/`)
- [x] calculator.ts (사주팔자 계산)
- [x] constants.ts (오행 상수, 일간 이모지) ✅ NEW

### Utils (`src/lib/utils/`)
- [x] error-messages.ts (에러 메시지 상수)
- [x] rate-limit.ts (API 요청 제한)
- [x] validation.ts (입력 검증)
- [x] markdown.ts (마크다운 파싱) ✅ NEW

### 결과 컴포넌트 (`src/components/result/`)
- [x] YearlyResultContent.tsx (신년운세 결과 UI)
- [x] CompatibilityResultContent.tsx (궁합 결과 UI)
- [x] DailyResultContent.tsx (오늘의 운세 결과 UI)
- [x] InterpretationCard.tsx (LLM 해석 카드) ✅ NEW
- [x] FallbackInterpretation.tsx (폴백 해석) ✅ NEW

### Hooks (`src/hooks/`)
- [x] useAuth.ts (인증 상태 관리)
- [x] useKakaoShare.ts (카카오톡 공유 SDK)

### 타입 (`src/types/`)
- [x] database.ts (Supabase 테이블 타입)
- [x] saju.ts (사주 결과 타입)
- [x] kakao.d.ts (카카오 SDK 타입 선언)

### 페이지 구조
```
/ (랜딩페이지)
├── /auth/login (시작하기 - 소셜로그인/이메일)
├── /auth/email-login (이메일 로그인)
├── /auth/signup (이메일 회원가입)
├── /auth/callback (OAuth 콜백)
├── /home (사주 유형 선택)
│     └── /saju/[type] (인물 선택 또는 정보 입력)
│           └── /saju/preview (만세력 미리보기)
│                 └── /saju/result (결과 페이지)
├── /saju/shared/[id] (공유된 결과 - 로그인 불필요) ✅ NEW
├── /mypage (마이페이지)
├── /coin (코인 충전)
├── /payment/success, /payment/fail (결제 결과)
├── /terms (서비스 이용약관) ✅ NEW
├── /privacy (개인정보처리방침) ✅ NEW
└── /refund (환불 정책) ✅ NEW
```

### API Routes
```
/api/saju/calculate     - 사주팔자 계산
/api/saju/interpret     - LLM 해석
/api/saju/save          - 결과 저장
/api/saju/history       - 조회 기록 (GET)
/api/saju/history/[id]  - 기록 조회/삭제 (GET/DELETE)
/api/saju/use-coin      - 코인 차감
/api/saju/refund-coin   - 코인 환불 (실패 시 롤백)
/api/saju/daily         - 오늘의 운세 (하루 1회)
/api/saju/check-existing - 기존 기록 확인 (중복 결제 방지) ✅ NEW
/api/saju/shared/[id]   - 공유 결과 조회 (공개)
/api/coin/balance       - 코인 잔액 조회
/api/coin/packages      - 코인 패키지 목록
/api/persons            - 인물 정보 저장/조회
/api/payment/initiate   - 결제 시작 (토스페이먼츠)
/api/payment/confirm    - 결제 확인 (토스페이먼츠)
/api/payment/kakaopay/ready   - 카카오페이 결제 준비
/api/payment/kakaopay/approve - 카카오페이 결제 승인
/api/payment/kakaopay/cancel  - 카카오페이 결제 취소
/api/share/reward       - 공유 리워드 (GET: 수령 여부, POST: 지급) ✅ NEW
/api/admin/cache-stats  - 캐시 통계 조회 (관리자용) ✅ NEW
/api/admin/status       - 시스템 상태 조회 (관리자용) ✅ NEW
```

### Cache (`src/lib/cache/`)
- [x] interpretation-cache.ts (LLM 해석 결과 캐싱) ✅ NEW

### SQL 마이그레이션
- [x] supabase/migrations/001_initial_schema.sql (전체 스키마)
- [x] supabase/migrations/003_interpretation_cache.sql (캐시 테이블) ✅ NEW

---

## 🚧 MVP 출시 전 필수 작업

### 높은 우선순위
- [x] 카카오 로그인 설정 ✅ (2025-01-16)
- [x] 구글 로그인 설정 ✅ (2025-01-16)
- [x] 코인 차감 로직 연결 ✅ (2025-01-16)
- [x] Vercel 배포 및 도메인 연결 ✅ (2025-01-16) - https://bazi-azure.vercel.app
- [x] GitHub 저장소 설정 ✅ (2025-01-16) - https://github.com/JAYAMIORG/paljjanyang
- [x] 사주 정보 저장/재사용 기능 ✅ (2025-01-16)
- [x] 토스페이먼츠 API 키 설정 및 실결제 테스트 ✅ (2026-01-21)

### 중간 우선순위
- [x] 궁합 계산 API 및 결과 페이지 ✅ (2025-01-21)
  - 두 사람 비교 UI (오행 비교 차트)
  - 궁합 점수 및 등급 표시
  - 케미, 주의점, 올해 관계운 분석
- [x] 신년운세 월별 결과 페이지 ✅ (2025-01-21)
- [x] 이용약관/개인정보처리방침 페이지 ✅ (2025-01-20)
  - /terms - 서비스 이용약관
  - /privacy - 개인정보처리방침
  - /refund - 환불 정책
- [x] 결제 취소 API ✅ (2025-01-20)
  - /api/payment/kakaopay/cancel - 카카오페이 결제 취소
- [x] 에러 처리 및 로딩 상태 개선 ✅ (2025-01-21)
  - 공통 Feedback 컴포넌트 구현 (LoadingScreen, ErrorScreen, EmptyState 등)
  - 마이페이지, 결과 페이지, preview 페이지, 입력 페이지에 적용

### 낮은 우선순위 (출시 후)
- [x] 카카오톡 공유 기능 ✅ (2025-01-20)
- [x] 결과 카드 이미지 생성 (공유용) ✅ (2025-01-20)
- [x] 인스타 공유 기능 (전체 해석 포함) ✅ (2025-01-20)
- [x] 새로고침 시 결과 캐싱 ✅ (2025-01-20)
- [x] 카카오페이 결제 추가 ✅ (2025-01-20)
- [x] 공유 리워드 (공유 시 코인 적립) ✅ (2025-01-20)
- [x] 사업자 정보 푸터 추가 ✅ (2025-01-20)
- [x] UX 개선 ✅ (2025-01-20)
  - 사주 결과 페이지 전체 로딩 화면으로 변경
  - 로그아웃 시 랜딩페이지로 이동
  - 법적 페이지 뒤로가기 히스토리 사용
- [x] OG Image 소셜 공유 개선 ✅ (2026-01-23)
  - 공유 페이지 동적 OG 이미지 생성 (opengraph-image.tsx)
  - 프로덕션 URL 사용으로 배포 환경 안정화
- [x] 일주 동물 기능 강화 ✅ (2026-01-23)
  - 60갑자 동물 이미지 추가 (public/images/animals/)
  - 일주 동물 이름 형식 변경: "하얀 강아지 (경술)"
  - 결과 페이지에 일주 동물 이미지 표시
  - 이미지 클릭 시 다운로드 기능 (html2canvas)
  - "나의 일주" 섹션을 최상단으로 이동
- [x] 공유 페이지 개선 ✅ (2026-01-23)
  - 가격 표기 변경: "1코인" → "880원"
  - 헤더 타이틀 제거로 깔끔한 UI
- [x] 마이페이지 결과 조회 개선 ✅ (2026-01-23)
  - 기존 /saju/reading/[id] → /saju/result?id=[id] 로 변경
  - 본 결과 페이지와 동일한 포맷으로 표시
- [x] 동일 프로필 재조회 시 기존 기록 표시 ✅ (2026-01-23)
  - /api/saju/check-existing API 추가
  - 같은 계정 + 생년월일 + 성별 + 타입으로 기존 기록 확인
  - 기존 기록 있으면 코인 미차감, 기록 없으면 코인 차감
  - 신년운세는 연도도 확인, 궁합은 두 사람 모두 확인
- [ ] 푸시 알림

---

## 배포 정보

- **Production URL**: https://bazi-azure.vercel.app
- **GitHub Repository**: https://github.com/JAYAMIORG/paljjanyang
- **Supabase Project**: lwgkuinqsrqkzybgexqo

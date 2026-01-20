# 팔자냥 개발 체크리스트

> 작성일: 2025-01-15
> 최종 업데이트: 2025-01-20
> 상태: MVP 개발 중 (공유 기능 구현 완료)

---

## 기능 우선순위

| 우선순위 | 기능 | 설명 | 상태 |
|----------|------|------|------|
| P0 | 개인 사주 | 사주팔자 + 인생 전체 분석 | **완료** |
| P0 | 신년운세 | 세운 + 월운 기반 올해 월별 운세 | UI 완료 |
| P0 | 궁합 | 두 사람의 사주 궁합 분석 | **UI 완료** |
| P0 | 연애운 | 연애/결혼 관련 운세 | UI 완료 |
| P0 | 만세력 미리보기 | 결제 전 사주팔자 무료 확인 | **완료** |
| P0 | 사주 정보 저장 | 입력한 사주 정보 저장/재사용 | **완료** |
| P0 | 인스타 공유 | 결과 카드 이미지 공유 | **보완 필요** |
| P2 | 오늘의 운세 | 무료, 일일 재방문 유도 | 대기 |
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
- [ ] 궁합 계산 API Route 생성

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
- [ ] 토스페이먼츠 실결제 테스트 (API 키 설정 필요)
- [ ] 카카오페이 연동

### 사주 정보 저장
- [x] 인물 정보 저장 API (POST /api/persons) ✅ (2025-01-16)
- [x] 저장된 인물 목록 조회 API (GET /api/persons) ✅ (2025-01-16)
- [x] 사주 입력 페이지 플로우 개선 ✅ (2025-01-16)
  - 저장된 정보 없으면 → 바로 입력 폼
  - 저장된 정보 있으면 → 목록에서 선택 또는 새로 입력
- [x] 궁합용 2인 선택 UI ✅ (2025-01-16)
- [x] 사주 기록 삭제 API (DELETE /api/saju/history/[id]) ✅ (2025-01-16)

### 화면 개발
- [x] 랜딩 페이지 ✅ (2025-01-16)
- [x] 홈 페이지 (사주 유형 선택) ✅ (2025-01-16)
- [x] 정보 입력 페이지 (저장/선택 기능 포함) ✅ (2025-01-16)
- [x] 만세력 미리보기 페이지 (결제 유도) ✅ (2025-01-16)
- [x] 결과 페이지 (개인 사주) ✅ (2025-01-16)
- [x] 마이페이지 (과거 기록, 코인 잔액) ✅ (2025-01-16)
- [x] 코인 충전 페이지 ✅ (2025-01-16)
- [x] 결제 성공/실패 페이지 ✅ (2025-01-16)
- [ ] 결과 페이지 (신년운세 - 월별)

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
- [ ] 인스타 공유 버튼 ⚠️ (보완 필요)
  - Web Share API + 이미지 생성은 구현됨
  - 데스크톱에서는 이미지 다운로드 후 수동 업로드 필요
  - 인스타 스토리 직접 공유는 Instagram Graph API 필요 (비즈니스 계정만)
- [ ] 공유 리워드 로직

---

## Phase 2: 개선 (v1.1)

- [ ] 카카오페이 추가
- [ ] 오늘의 운세 (무료)
- [ ] 푸시 알림
- [ ] 성능 최적화
- [ ] 버그 수정

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

### 레이아웃 컴포넌트 (`src/components/layout/`)
- [x] Header (로고, 뒤로가기, 로그인 상태)

### Supabase (`src/lib/supabase/`)
- [x] client.ts (브라우저 클라이언트)
- [x] server.ts (서버 클라이언트)
- [x] middleware.ts (세션 갱신)
- [x] admin.ts (Service Role 클라이언트 - RLS 우회용)

### LLM (`src/lib/llm/`)
- [x] prompts.ts (시스템 프롬프트, 사주 유형별 프롬프트)

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
└── /payment/success, /payment/fail (결제 결과)
```

### API Routes
```
/api/saju/calculate     - 사주팔자 계산
/api/saju/interpret     - LLM 해석
/api/saju/save          - 결과 저장
/api/saju/history       - 조회 기록 (GET)
/api/saju/history/[id]  - 기록 삭제 (DELETE)
/api/saju/use-coin      - 코인 차감
/api/saju/shared/[id]   - 공유 결과 조회 (공개) ✅ NEW
/api/coin/balance       - 코인 잔액 조회
/api/coin/packages      - 코인 패키지 목록
/api/persons            - 인물 정보 저장/조회
/api/payment/initiate   - 결제 시작
/api/payment/confirm    - 결제 확인
```

### SQL 마이그레이션
- [x] supabase/migrations/001_initial_schema.sql (전체 스키마)

---

## 🚧 MVP 출시 전 필수 작업

### 높은 우선순위
- [x] 카카오 로그인 설정 ✅ (2025-01-16)
- [x] 구글 로그인 설정 ✅ (2025-01-16)
- [x] 코인 차감 로직 연결 ✅ (2025-01-16)
- [x] Vercel 배포 및 도메인 연결 ✅ (2025-01-16) - https://bazi-azure.vercel.app
- [x] GitHub 저장소 설정 ✅ (2025-01-16) - https://github.com/JAYAMIORG/paljjanyang
- [x] 사주 정보 저장/재사용 기능 ✅ (2025-01-16)
- [ ] 토스페이먼츠 API 키 설정 및 실결제 테스트

### 중간 우선순위
- [ ] 궁합 계산 API 및 결과 페이지
- [ ] 신년운세 월별 결과 페이지
- [ ] 이용약관/개인정보처리방침 페이지
- [ ] 에러 처리 및 로딩 상태 개선

### 낮은 우선순위 (출시 후)
- [x] 카카오톡 공유 기능 ✅ (2025-01-20)
- [x] 결과 카드 이미지 생성 (공유용) ✅ (2025-01-20)
- [ ] 인스타 공유 기능 개선 (Instagram Graph API 또는 대안 검토)
- [ ] 카카오페이 결제 추가
- [ ] 푸시 알림
- [ ] 공유 리워드 (공유 시 코인 적립)

---

## 배포 정보

- **Production URL**: https://bazi-azure.vercel.app
- **GitHub Repository**: https://github.com/JAYAMIORG/paljjanyang
- **Supabase Project**: lwgkuinqsrqkzybgexqo

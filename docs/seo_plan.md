# 팔자냥 SEO 최적화 구현 계획

> 작성일: 2026-01-27
> 상태: 도메인 구입 후 진행 예정

## 설정 정보
- **현재 도메인**: `bazi-azure.vercel.app` (추후 커스텀 도메인으로 변경 예정)
- **PWA 아이콘**: favicon.ico 기반으로 생성
- **검색엔진 인증**: 나중에 추가 (아래 가이드 참조)

---

## 현재 상태 요약

### 구현됨
- 루트 layout.tsx: 기본 metadata (title, description, keywords, openGraph, twitter)
- OG 이미지: 루트 + 공유 페이지 동적 생성
- favicon.ico (48x48)
- 공유 페이지 동적 메타데이터 (`/saju/shared/[id]`)

### 미구현
- robots.txt / sitemap.xml
- manifest.json (PWA)
- apple-touch-icon
- JSON-LD 구조화된 데이터
- 페이지별 메타데이터 (법적 페이지, 홈 등)
- Canonical URL
- 검색엔진 인증 코드

---

## 구현 계획

### Phase 1: 필수 SEO 파일 (높은 우선순위)

#### 1.1 robots.ts 생성
**파일**: `/src/app/robots.ts`

크롤링 정책:
- **허용**: `/`, `/home`, `/terms`, `/privacy`, `/refund`, `/saju/shared/*`
- **차단**: `/api/*`, `/auth/*`, `/mypage`, `/coin`, `/payment/*`, `/saju/[type]`, `/saju/preview`, `/saju/result`, `/saju/reading/*`

#### 1.2 sitemap.ts 생성
**파일**: `/src/app/sitemap.ts`

- 정적 페이지: `/`, `/home`, `/terms`, `/privacy`, `/refund`
- 동적 페이지: `/saju/shared/[id]` (Supabase에서 최근 30일 기록 조회)

#### 1.3 환경변수 URL 통일
모든 파일에서 `NEXT_PUBLIC_APP_URL` 기본값을 `https://bazi-azure.vercel.app`으로 통일
(추후 커스텀 도메인 구매 시 환경변수만 변경하면 됨)

수정 파일:
- `/src/app/opengraph-image.tsx`
- `/src/app/saju/shared/[id]/opengraph-image.tsx`
- `/src/app/saju/shared/[id]/layout.tsx`

---

### Phase 2: 메타데이터 개선 (중간 우선순위)

#### 2.1 루트 layout.tsx 강화
**파일**: `/src/app/layout.tsx`

추가/수정 사항:
- `metadataBase` 설정 (Canonical URL 자동 처리)
- `title.template` 추가 (`%s | 팔자냥`)
- `alternates.canonical` 추가
- `robots` 설정 (googleBot 포함)
- `icons` 설정 (apple-touch-icon)
- 키워드 확장: 사주팔자, 오행, 대운, 세운

#### 2.2 페이지별 layout.tsx 생성

| 페이지 | 파일 | 설정 |
|--------|------|------|
| /home | `/src/app/home/layout.tsx` | title: "사주 유형 선택" |
| /terms | `/src/app/terms/layout.tsx` | title: "서비스 이용약관" |
| /privacy | `/src/app/privacy/layout.tsx` | title: "개인정보처리방침" |
| /refund | `/src/app/refund/layout.tsx` | title: "환불 정책" |

#### 2.3 noindex 페이지 layout.tsx 생성

| 경로 | 파일 | 이유 |
|------|------|------|
| /auth/* | `/src/app/auth/layout.tsx` | 인증 페이지 |
| /mypage | `/src/app/mypage/layout.tsx` | 개인 정보 |
| /coin | `/src/app/coin/layout.tsx` | 내부 기능 |
| /payment/* | `/src/app/payment/layout.tsx` | 결제 페이지 |
| /saju/[type] 등 | `/src/app/saju/layout.tsx` | 인증 필요 |

**주의**: `/saju/shared/[id]/layout.tsx`에서 `robots: { index: true }` 명시 필요

---

### Phase 3: 구조화된 데이터 (중간 우선순위)

#### 3.1 JSON-LD 컴포넌트 생성
**파일**: `/src/components/seo/JsonLd.tsx`

포함할 스키마:
- **Organization**: ChartIQ 회사 정보
- **LocalBusiness**: 사업자 정보 (박재호, 794-29-01712, 경기도 화성시)
- **WebSite**: 사이트 정보 + 검색 기능
- **Service**: 사주 서비스 카탈로그 (개인사주, 신년운세, 궁합, 연애운)

#### 3.2 루트 layout에 JSON-LD 삽입
`<head>` 태그 내에 JSON-LD 스크립트 추가

---

### Phase 4: PWA 지원 (낮은 우선순위)

#### 4.1 manifest.ts 생성
**파일**: `/src/app/manifest.ts`

설정:
- name: "팔자냥 - 나만의 사주 이야기"
- short_name: "팔자냥"
- theme_color: "#6B5B95"
- background_color: "#FFF8F0"
- display: "standalone"

#### 4.2 아이콘 파일 생성
기존 favicon.ico 기반으로 아이콘 생성:
- `/public/apple-touch-icon.png` (180x180)
- `/public/images/icons/icon-192x192.png`
- `/public/images/icons/icon-512x512.png`

**생성 방법**: favicon.ico를 기반으로 리사이즈하여 생성

---

## 파일 변경 목록

### 신규 생성 (11개)
```
/src/app/robots.ts
/src/app/sitemap.ts
/src/app/manifest.ts
/src/components/seo/JsonLd.tsx
/src/app/home/layout.tsx
/src/app/terms/layout.tsx
/src/app/privacy/layout.tsx
/src/app/refund/layout.tsx
/src/app/auth/layout.tsx
/src/app/coin/layout.tsx
/src/app/payment/layout.tsx
```

### 수정 (4개)
```
/src/app/layout.tsx - metadata 강화, JSON-LD 추가
/src/app/opengraph-image.tsx - URL 기본값 통일
/src/app/saju/shared/[id]/opengraph-image.tsx - URL 기본값 통일
/src/app/saju/shared/[id]/layout.tsx - robots index:true 명시
```

### 기존 파일 확인 필요
```
/src/app/saju/layout.tsx - 존재하면 수정, 없으면 생성
/src/app/mypage/layout.tsx - 존재하면 수정, 없으면 생성
```

---

## 검증 방법

### 1. 빌드 테스트
```bash
npm run build
```

### 2. 로컬 확인
```bash
npm run dev
# 브라우저에서 확인:
# - /robots.txt
# - /sitemap.xml
# - /manifest.webmanifest
```

### 3. SEO 검증 도구
- Google Rich Results Test (JSON-LD 검증)
- Schema.org Validator (구조화된 데이터)
- Lighthouse SEO 점수 확인

### 4. 메타 태그 확인
- 각 페이지의 `<head>` 태그 검사
- OG 이미지 미리보기 (Facebook Sharing Debugger, Twitter Card Validator)

---

## 배포 후 추가 작업

1. **Google Search Console** 등록 및 sitemap 제출
2. **Naver Search Advisor** 등록 및 sitemap 제출
3. 검색엔진 인증 코드를 metadata.verification에 추가
4. 색인 상태 모니터링

---

## 예상 소요 작업량

| Phase | 작업 | 파일 수 |
|-------|------|--------|
| 1 | 필수 SEO 파일 | 3개 생성, 3개 수정 |
| 2 | 메타데이터 개선 | 7개 생성, 1개 수정 |
| 3 | JSON-LD | 1개 생성, 1개 수정 |
| 4 | PWA | 1개 생성, 3개 아이콘 |

---

## 검색엔진 인증 가이드

### Google Search Console 등록 방법

1. **사이트 등록**
   - https://search.google.com/search-console 접속
   - "속성 추가" → URL 접두어 방식 선택
   - `https://bazi-azure.vercel.app` 입력 (도메인 변경 후 새 도메인으로)

2. **소유권 확인** (HTML 태그 방식 권장)
   - "HTML 태그" 방식 선택
   - 메타 태그 코드 복사: `<meta name="google-site-verification" content="인증코드" />`

3. **코드 적용**
   - `/src/app/layout.tsx`의 metadata에 추가:
   ```typescript
   export const metadata: Metadata = {
     // ...기존 설정
     verification: {
       google: '인증코드',
     },
   }
   ```

4. **Sitemap 제출**
   - Search Console → 색인 → Sitemaps
   - `https://your-domain.com/sitemap.xml` 제출

### Naver Search Advisor 등록 방법

1. **사이트 등록**
   - https://searchadvisor.naver.com 접속
   - "사이트 관리" → "사이트 등록"
   - 도메인 URL 입력

2. **소유권 확인** (HTML 태그 방식)
   - "HTML 태그" 방식 선택
   - 메타 태그 코드 복사

3. **코드 적용**
   ```typescript
   export const metadata: Metadata = {
     verification: {
       google: 'google인증코드',
       other: {
         'naver-site-verification': 'naver인증코드',
       },
     },
   }
   ```

4. **Sitemap 제출**
   - 요청 → 사이트맵 제출
   - `https://your-domain.com/sitemap.xml` 입력

### 인증 완료 후 확인사항
- 색인 생성 요청 (URL 검사 → 색인 생성 요청)
- 일주일 후 검색 결과 확인: `site:your-domain.com`

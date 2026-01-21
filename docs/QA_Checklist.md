# 팔자냥 QA 종합 분석 보고서

> 작성일: 2025-01-20
> 분석 범위: 전체 프론트엔드/백엔드 코드

---

## 🚨 Critical (즉시 수정 필요)

### 1. 보안 취약점

| 문제 | 위치 | 설명 | 상태 |
|------|------|------|------|
| **LLM API 인증 없음** | `/api/saju/interpret` | 인증 없이 OpenAI API 호출 가능 → 비용 공격 위험 | [x] ✅ 인증 체크 구현됨 |
| **테스트 모드 보안** | `/api/payment/confirm`, `coin/page.tsx` | 환경변수 누락 시 무료 결제 가능 | [x] ✅ PAYMENT_TEST_MODE 명시적 설정 필요 |
| **공유 결과 노출** | `/api/saju/shared/[id]` | 모든 사용자 결과가 UUID만 알면 조회 가능 | [x] ✅ 의도된 기능 (공유 목적) |

### 2. Race Condition (동시성 버그)

| 문제 | 위치 | 설명 | 상태 |
|------|------|------|------|
| **코인 중복 차감/지급** | `/api/saju/use-coin` | 동시 요청 시 잔액 불일치 | [x] ✅ RPC `use_coin` 함수로 atomic 처리 |
| **결제 중복 처리** | `/api/payment/confirm` | 같은 orderId로 중복 confirm 시 코인 여러 번 지급 | [x] ✅ RPC `process_payment` 함수로 atomic 처리 |
| **카카오페이 중복** | `/api/payment/kakaopay/approve` | 동일 결제 approve 두 번 호출 시 코인 중복 | [x] ✅ RPC `process_payment` 함수로 atomic 처리 |
| **공유 리워드 중복** | `/api/share/reward` | 동시 요청 시 보상 중복 지급 | [x] ✅ RPC `claim_share_reward` 함수로 atomic 처리 |

### 3. 데이터 무결성

| 문제 | 위치 | 설명 | 상태 |
|------|------|------|------|
| **코인 차감 후 롤백 없음** | `result/page.tsx` | 코인 차감 후 사주 계산 실패해도 코인 복구 안 됨 | [x] ✅ `/api/saju/refund-coin` API 및 RPC `refund_coin` 함수 구현 |
| **트랜잭션 미사용** | 결제 API들 | DB 작업 중간 실패 시 데이터 불일치 | [x] ✅ Supabase RPC 함수로 atomic 트랜잭션 처리 |

---

## 🟠 High (빠른 수정 권장)

### 기능 버그

| 문제 | 위치 | 설명 | 상태 |
|------|------|------|------|
| **소셜 로그인 redirect 안 됨** | `useAuth.ts`, `callback/route.ts` | 카카오/구글 로그인 후 원래 페이지로 이동 안 함 | [x] ✅ redirectTo 파라미터 추가 |
| **날짜 유효성 검증 없음** | `saju/[type]/page.tsx` | 2월 31일 같은 잘못된 날짜 선택 가능 | [x] ✅ 월/연도에 따라 일 옵션 동적 조정 |
| **궁합 미리보기 미지원** | `preview/page.tsx` | 두 번째 사람 정보 처리 안 됨 | [x] ✅ 두 사람 사주 비교 UI 구현 |
| **토스페이먼츠 successUrl 버그** | `coin/page.tsx:131` | redirectParam 구성 불일치 | [x] ✅ successUrl 변수로 정리 |

### 하드코딩 이슈

| 문제 | 위치 | 수정 필요 | 상태 |
|------|------|------|------|
| 저작권 연도 | `page.tsx:163`, `Footer.tsx` | `2025` → 동적 연도 | [x] ✅ new Date().getFullYear() 사용 |
| 신년운세 설명 | `home/page.tsx:19` | `2025년` → `${new Date().getFullYear()}년` | [x] ✅ 동적 연도 적용 |
| 약관 링크 | `signup/page.tsx:150-151` | `href="#"` → 실제 페이지 링크 | [x] ✅ /terms, /privacy 링크 연결 |

---

## 🟡 Medium (개선 권장)

### 접근성 (a11y)

| 문제 | 위치 | 상태 |
|------|------|------|
| Button에 `aria-busy`, `aria-disabled` 없음 | `Button.tsx` | [x] ✅ aria-busy, aria-disabled, role="status" 추가 |
| Input/Select에 `aria-describedby`, `aria-invalid` 없음 | `Input.tsx`, `Select.tsx` | [x] ✅ aria-invalid, aria-describedby 추가 |
| 뒤로가기 버튼에 `aria-label` 없음 | `Header.tsx` | [x] ✅ aria-label, aria-hidden 추가 |
| 에러 메시지에 `role="alert"` 없음 | 로그인 페이지들 | [x] ✅ Input/Select 에러에 role="alert" 추가 |
| 모달에 포커스 트랩 없음 | `result/page.tsx` | [ ] |
| 별점/이모지에 `aria-hidden` 없음 | 랜딩 페이지 | [x] ✅ 이모지, 별점에 aria-hidden 추가 |
| 소셜 로그인 버튼에 `aria-label` 없음 | `login/page.tsx` | [x] ✅ aria-label, aria-hidden 추가 |
| 성별 선택 버튼에 `role="radio"` 없음 | `saju/[type]/page.tsx` | [x] ✅ role="radiogroup", role="radio", aria-checked 추가 |
| 패키지/결제수단 선택에 ARIA 속성 없음 | `coin/page.tsx` | [x] ✅ role="radiogroup", role="radio", aria-checked 추가 |

### UX 개선

| 문제 | 설명 | 상태 |
|------|------|------|
| `alert()`/`confirm()` 사용 | 네이티브 대화상자 → 커스텀 모달 권장 | [ ] |
| 에러 메시지 영문 노출 | Supabase 에러 한국어화 필요 | [ ] |
| 비밀번호 찾기 없음 | 이메일 로그인 페이지에 추가 필요 | [ ] |
| 데스크톱 카카오 공유 | "모바일에서만" 모달 → 대안 제공 | [ ] |
| 사주 기록 클릭 안 됨 | 마이페이지에서 기록 클릭 시 상세 보기 없음 | [ ] |
| 로딩 스켈레톤 부족 | 인증 로딩 중 스켈레톤 UI 없음 | [ ] |
| 랜딩 페이지 로그인 링크 없음 | 기존 사용자 접근성 저하 | [x] ✅ 최종 CTA 섹션에 로그인 링크 추가 |
| 가격 정보 미표시 | 사주 유형 선택 시 코인 가격 표시 없음 | [ ] |
| 결제 중복 클릭 방지 없음 | `handlePurchase` 실행 중 버튼 비활성화 없음 | [x] ✅ isPurchasing 상태 추가 |
| 결제 실패 시 재시도 옵션 없음 | 결제 확인 실패 시 사용자 대응 방법 없음 | [ ] |

### 코드 품질

| 문제 | 위치 | 상태 |
|------|------|------|
| 코드 중복 | `InterpretationCard`, `FallbackInterpretation` 결과/공유 페이지 중복 | [ ] |
| ESLint 비활성화 주석 | `result/page.tsx:251, 293` | [ ] |
| Header 내부 컴포넌트 재정의 | 매 렌더링마다 BackButton/BackLink 재생성 | [x] ✅ BackIcon 컴포넌트 외부 정의, 인라인 JSX로 변경 |
| Supabase 타입 미적용 | `server.ts`, `admin.ts`에서 `any` 사용 | [ ] |
| SVG 아이콘 중복 | 인라인 SVG 반복 사용, 컴포넌트화 필요 | [ ] |
| 변수명 섀도잉 | `coin/page.tsx:84` redirectUrl 중복 선언 | [ ] |
| 디버그 로그 정리 안 됨 | `kakaopay/ready/route.ts` console.log 다수 | [x] ✅ 디버그 로그 제거, 에러 로그만 유지 |

### API 개선

| 문제 | 위치 | 상태 |
|------|------|------|
| API 호출 최적화 | `mypage/page.tsx` 순차 호출 → `Promise.all()` | [x] ✅ Promise.all로 병렬 호출 |
| Rate Limiting 미적용 | 모든 API | [ ] |
| 입력값 검증 강화 | `/api/persons`, `/api/saju/history` | [ ] |
| DELETE 성공 여부 미확인 | `/api/saju/history/[id]` | [ ] |
| 비동기 작업 정리 없음 | result/page.tsx AbortController 미사용 | [ ] |

---

## 🟢 Low (향후 개선)

| 항목 | 설명 | 상태 |
|------|------|------|
| 무한 스크롤/페이지네이션 | 마이페이지 기록 목록 | [ ] |
| Soft Delete | 삭제된 기록 복구 불가 | [ ] |
| 결제 에러 코드 매핑 확장 | 토스/카카오페이 다양한 에러 처리 | [ ] |
| 폼 상태 영속성 | sessionStorage 임시 저장 | [ ] |
| 랜딩 페이지 Server Component | `'use client'` 제거로 성능 향상 | [ ] |
| 사용자 이메일 노출 | 마이페이지 화면 캡처 시 개인정보 노출 가능 | [ ] |
| Idempotency Key | 결제/보상 API에 중복 요청 방지 키 도입 | [ ] |

---

## 📊 요약

| 우선순위 | 개수 | 핵심 항목 |
|----------|------|----------|
| 🚨 Critical | ~~8개~~ **0개** ✅ | ~~인증, Race Condition, 데이터 무결성~~ 모두 해결됨 |
| 🟠 High | ~~7개~~ **0개** ✅ | ~~소셜 로그인, 날짜 검증, 하드코딩, 궁합 미리보기, 토스 successUrl~~ 모두 해결됨 |
| 🟡 Medium | 25개+ | 접근성, UX, 코드 품질, API |
| 🟢 Low | 7개 | 페이지네이션, Soft Delete 등 |

---

## 🛠️ 권장 수정 순서

### Phase 1: 즉시 (1-2일) ✅ 완료
1. ~~LLM API 인증 추가 (`/api/saju/interpret`)~~ ✅
2. ~~테스트 모드 보안 강화 (명시적 환경변수 분리)~~ ✅

### Phase 2: 1주 내 ✅ 완료
1. ~~Race Condition 해결~~ ✅
   - ~~Supabase RPC 함수로 atomic update 구현~~ → `002_atomic_coin_functions.sql`
   - ~~결제 상태 `processing` 중간 상태 추가~~ → `process_payment()` 함수
2. ~~코인 차감 실패 시 롤백 로직 추가~~ ✅ → `/api/saju/refund-coin`

### Phase 3: 2주 내 ✅ 완료
1. ~~소셜 로그인 redirect 수정~~ ✅
2. ~~날짜 유효성 검증 추가~~ ✅
3. ~~하드코딩된 연도 동적 변경~~ ✅
4. ~~약관 링크 수정~~ ✅

### Phase 4: 1개월 내 (진행 중)
1. ~~접근성 (a11y) 전면 개선~~ → 일부 완료 (Button, Input, Select)
2. UX 개선 (커스텀 모달, 에러 메시지 한국어화)
3. 코드 중복 제거 및 리팩토링
4. ~~결제 중복 클릭 방지~~ ✅
5. ~~API 호출 최적화 (Promise.all)~~ ✅
6. ~~디버그 로그 정리~~ ✅

---

## 상세 해결 방안

### Race Condition 해결 (Supabase RPC 예시)

```sql
-- 코인 차감 atomic function
CREATE OR REPLACE FUNCTION use_coin(
  p_user_id UUID,
  p_amount INT,
  p_description TEXT
) RETURNS TABLE(success BOOLEAN, new_balance INT, error_message TEXT) AS $$
DECLARE
  v_current_balance INT;
  v_new_balance INT;
BEGIN
  -- Lock row for update
  SELECT balance INTO v_current_balance
  FROM coin_balances
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF v_current_balance IS NULL OR v_current_balance < p_amount THEN
    RETURN QUERY SELECT FALSE, COALESCE(v_current_balance, 0), '잔액이 부족합니다.'::TEXT;
    RETURN;
  END IF;

  v_new_balance := v_current_balance - p_amount;

  UPDATE coin_balances
  SET balance = v_new_balance, updated_at = NOW()
  WHERE user_id = p_user_id;

  INSERT INTO coin_transactions (user_id, amount, type, description, balance_before, balance_after)
  VALUES (p_user_id, -p_amount, 'spend', p_description, v_current_balance, v_new_balance);

  RETURN QUERY SELECT TRUE, v_new_balance, NULL::TEXT;
END;
$$ LANGUAGE plpgsql;
```

### 소셜 로그인 redirect 수정

```typescript
// useAuth.ts
const signInWithKakao = useCallback(async (redirectTo?: string): Promise<AuthResult> => {
  if (!supabase) {
    return { data: null, error: new Error('Supabase not configured') }
  }

  const callbackUrl = redirectTo
    ? `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`
    : `${window.location.origin}/auth/callback`

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'kakao',
    options: {
      redirectTo: callbackUrl,
    },
  })
  return { data, error }
}, [supabase])
```

### 접근성 개선 예시 (Button)

```typescript
<button
  ref={ref}
  disabled={disabled || isLoading}
  aria-busy={isLoading}
  aria-disabled={disabled || isLoading}
  className={...}
  {...props}
>
  {isLoading ? (
    <span className="flex items-center gap-2" role="status" aria-live="polite">
      <LoadingSpinner aria-hidden="true" />
      <span className="sr-only">로딩 중...</span>
    </span>
  ) : (
    children
  )}
</button>
```

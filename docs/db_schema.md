# 팔자냥 DB 스키마 설계

> 작성일: 2025-01-15
> Database: Supabase (PostgreSQL)

---

## 1. 스키마 개요

```
┌─────────────┐     ┌─────────────┐
│   users     │────<│   persons   │
│ (Supabase)  │     │ (저장된 인물) │
└─────────────┘     └──────┬──────┘
                           │
                           ▼
┌─────────────┐     ┌─────────────┐
│  payments   │────<│  readings   │
│   (결제)     │     │  (사주결과)  │
└─────────────┘     └──────┬──────┘
                           │
               ┌───────────┴───────────┐
               ▼                       ▼
         ┌─────────────┐         ┌─────────────┐
         │   shares    │         │  rewards    │
         │   (공유)     │         │   (쿠폰)    │
         └─────────────┘         └─────────────┘
```

---

## 2. 테이블 정의

### 2.1 profiles (사용자 프로필)

Supabase Auth의 `auth.users`와 연동되는 확장 프로필

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS 정책
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);
```

---

### 2.2 persons (저장된 인물 정보)

사용자가 저장한 본인/가족/연인 등의 생년월일 정보

```sql
CREATE TABLE persons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- 기본 정보
  name TEXT NOT NULL,                    -- 이름 (닉네임)
  relationship TEXT NOT NULL,            -- 관계: self, partner, family, friend, other

  -- 생년월일시
  birth_year INT NOT NULL,
  birth_month INT NOT NULL,
  birth_day INT NOT NULL,
  birth_hour INT,                        -- NULL = 시간 모름

  -- 추가 정보
  is_lunar BOOLEAN DEFAULT FALSE,        -- 음력 여부
  is_leap_month BOOLEAN DEFAULT FALSE,   -- 윤달 여부
  gender TEXT NOT NULL,                  -- male, female

  -- 메타
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- 제약조건
  CONSTRAINT valid_month CHECK (birth_month BETWEEN 1 AND 12),
  CONSTRAINT valid_day CHECK (birth_day BETWEEN 1 AND 31),
  CONSTRAINT valid_hour CHECK (birth_hour IS NULL OR birth_hour BETWEEN 0 AND 23),
  CONSTRAINT valid_gender CHECK (gender IN ('male', 'female')),
  CONSTRAINT valid_relationship CHECK (relationship IN ('self', 'partner', 'family', 'friend', 'other'))
);

-- 인덱스
CREATE INDEX idx_persons_user_id ON persons(user_id);

-- RLS
ALTER TABLE persons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own persons"
  ON persons FOR ALL
  USING (auth.uid() = user_id);
```

---

### 2.3 readings (사주 결과)

사주 분석 결과 저장

```sql
CREATE TYPE reading_type AS ENUM ('personal', 'yearly', 'compatibility', 'love');
CREATE TYPE reading_status AS ENUM ('pending', 'processing', 'completed', 'failed');

CREATE TABLE readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- 사주 유형
  type reading_type NOT NULL,
  status reading_status DEFAULT 'pending',

  -- 대상 인물 (개인 사주: 1명, 궁합: 2명)
  person1_id UUID REFERENCES persons(id) ON DELETE SET NULL,
  person2_id UUID REFERENCES persons(id) ON DELETE SET NULL,  -- 궁합일 때만 사용

  -- 사주 계산 결과 (정규화된 핵심 필드)
  person1_bazi JSONB,      -- {"year": "庚午", "month": "辛巳", "day": "庚辰", "time": "癸未"}
  person1_wuxing JSONB,    -- {"wood": 20, "fire": 40, "earth": 20, "metal": 10, "water": 10}
  person1_day_master TEXT, -- 일간 (예: "庚")

  person2_bazi JSONB,      -- 궁합일 때만
  person2_wuxing JSONB,
  person2_day_master TEXT,

  -- 궁합 점수 (궁합일 때만)
  compatibility_score INT, -- 0-100

  -- 신년운세 정보 (yearly일 때만)
  yearly_year INT,         -- 운세 대상 연도 (예: 2025)
  yearly_data JSONB,       -- {"summary": "...", "monthly": [...], "best_months": [5,9], "caution_months": [3,7]}

  -- LLM 해석 결과
  interpretation JSONB,    -- {"summary": "...", "sections": [...], "advice": "..."}

  -- 한글 간지 (표시용)
  korean_ganji TEXT,       -- "경오년 신사월 경진일"

  -- 코인 사용 정보
  coins_used DECIMAL(10,2) DEFAULT 1,     -- 사용된 코인
  is_free BOOLEAN DEFAULT FALSE,          -- 무료 리워드로 본 경우
  reward_id UUID REFERENCES rewards(id),
  transaction_id UUID,                    -- coin_transactions 참조

  -- 메타
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,

  -- 제약조건
  CONSTRAINT compatibility_requires_two CHECK (
    (type = 'compatibility' AND person2_id IS NOT NULL) OR
    (type != 'compatibility' AND person2_id IS NULL)
  ),
  CONSTRAINT yearly_requires_year CHECK (
    (type = 'yearly' AND yearly_year IS NOT NULL) OR
    (type != 'yearly')
  )
);

-- 인덱스
CREATE INDEX idx_readings_user_id ON readings(user_id);
CREATE INDEX idx_readings_created_at ON readings(created_at DESC);
CREATE INDEX idx_readings_type ON readings(type);

-- RLS
ALTER TABLE readings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own readings"
  ON readings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own readings"
  ON readings FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

---

### 2.4 coin_balances (코인 잔액)

사용자의 코인 잔액 관리

```sql
CREATE TABLE coin_balances (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  balance DECIMAL(10,2) NOT NULL DEFAULT 0,  -- 소수점 지원 (0.5 코인 등)
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT positive_balance CHECK (balance >= 0)
);

-- RLS
ALTER TABLE coin_balances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own balance"
  ON coin_balances FOR SELECT
  USING (auth.uid() = user_id);
```

---

### 2.5 coin_transactions (코인 거래 내역)

코인 충전/사용 기록

```sql
CREATE TYPE transaction_type AS ENUM ('purchase', 'spend', 'reward', 'refund');
CREATE TYPE spend_target AS ENUM ('reading');

CREATE TABLE coin_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- 거래 정보
  type transaction_type NOT NULL,
  amount DECIMAL(10,2) NOT NULL,          -- 양수: 충전, 음수: 사용

  -- 충전 시 (purchase)
  payment_id UUID REFERENCES payments(id),

  -- 사용 시 (spend)
  target spend_target,
  target_id UUID,                          -- reading_id 또는 chat_bundle_id
  description TEXT,                        -- "개인 사주", "추가 대화 5회" 등

  -- 잔액 스냅샷
  balance_before DECIMAL(10,2) NOT NULL,
  balance_after DECIMAL(10,2) NOT NULL,

  -- 메타
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_coin_transactions_user_id ON coin_transactions(user_id);
CREATE INDEX idx_coin_transactions_created_at ON coin_transactions(created_at DESC);

-- RLS
ALTER TABLE coin_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
  ON coin_transactions FOR SELECT
  USING (auth.uid() = user_id);
```

---

### 2.6 coin_packages (코인 패키지 - 상품)

구매 가능한 코인 패키지 정의

```sql
CREATE TABLE coin_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,                     -- "기본 패키지", "인기 패키지" 등
  coins DECIMAL(10,2) NOT NULL,           -- 제공 코인 수
  price INT NOT NULL,                     -- 가격 (원)
  bonus_coins DECIMAL(10,2) DEFAULT 0,    -- 보너스 코인
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 기본 패키지 데이터
INSERT INTO coin_packages (name, coins, price, bonus_coins, sort_order) VALUES
  ('1 코인', 1, 1500, 0, 1),
  ('5 코인', 5, 6500, 0.5, 2),           -- 500원 할인 + 0.5 보너스
  ('10 코인', 10, 12000, 2, 3);          -- 3000원 할인 + 2 보너스
```

---

### 2.7 payments (결제)

코인 구매를 위한 결제

```sql
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded', 'cancelled');
CREATE TYPE payment_method AS ENUM ('toss', 'kakao', 'card');

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- 결제 정보
  amount INT NOT NULL,                    -- 금액 (원)
  currency TEXT DEFAULT 'KRW',
  method payment_method,
  status payment_status DEFAULT 'pending',

  -- 코인 패키지
  package_id UUID REFERENCES coin_packages(id),
  coins_purchased DECIMAL(10,2),          -- 실제 충전된 코인 (보너스 포함)

  -- 외부 결제 시스템 연동
  external_payment_id TEXT,               -- 토스/카카오 결제 ID
  external_order_id TEXT,                 -- 주문 ID

  -- 메타
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  failure_reason TEXT,

  metadata JSONB                          -- 추가 정보
);

-- 인덱스
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_external_id ON payments(external_payment_id);

-- RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payments"
  ON payments FOR SELECT
  USING (auth.uid() = user_id);
```

---

### 2.5 rewards (리워드/쿠폰)

```sql
CREATE TYPE reward_type AS ENUM ('share', 'referral', 'promotion', 'other');
CREATE TYPE reward_status AS ENUM ('active', 'used', 'expired');

CREATE TABLE rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- 리워드 정보
  type reward_type NOT NULL,
  status reward_status DEFAULT 'active',

  -- 사용 조건
  valid_for reading_type[],              -- 사용 가능한 사주 유형 (NULL = 전체)

  -- 만료
  expires_at TIMESTAMPTZ,

  -- 사용 정보
  used_at TIMESTAMPTZ,
  used_reading_id UUID REFERENCES readings(id),

  -- 발급 사유
  source_share_id UUID,                   -- 공유로 받은 경우

  -- 메타
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_rewards_user_id ON rewards(user_id);
CREATE INDEX idx_rewards_status ON rewards(status);

-- RLS
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own rewards"
  ON rewards FOR SELECT
  USING (auth.uid() = user_id);
```

---

### 2.6 shares (공유 기록)

```sql
CREATE TYPE share_platform AS ENUM ('instagram', 'twitter', 'facebook', 'kakao', 'link');

CREATE TABLE shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reading_id UUID NOT NULL REFERENCES readings(id) ON DELETE CASCADE,

  -- 공유 정보
  platform share_platform NOT NULL,

  -- 리워드 발급 여부
  reward_issued BOOLEAN DEFAULT FALSE,
  reward_id UUID REFERENCES rewards(id),

  -- 메타
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 월별 공유 제한을 위한 인덱스
CREATE INDEX idx_shares_user_month ON shares(user_id, date_trunc('month', created_at));

-- RLS
ALTER TABLE shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own shares"
  ON shares FOR ALL
  USING (auth.uid() = user_id);
```

---

## 3. 주요 쿼리 예시

### 3.1 사용자의 최근 사주 기록 조회

```sql
SELECT
  r.id,
  r.type,
  r.korean_ganji,
  r.created_at,
  p1.name as person1_name,
  p2.name as person2_name
FROM readings r
LEFT JOIN persons p1 ON r.person1_id = p1.id
LEFT JOIN persons p2 ON r.person2_id = p2.id
WHERE r.user_id = $1
ORDER BY r.created_at DESC
LIMIT 10;
```

### 3.2 사용 가능한 리워드 조회

```sql
SELECT * FROM rewards
WHERE user_id = $1
  AND status = 'active'
  AND (expires_at IS NULL OR expires_at > NOW())
ORDER BY expires_at ASC NULLS LAST;
```

### 3.3 이번 달 공유 횟수 확인 (리워드 제한용)

```sql
SELECT COUNT(*) as share_count
FROM shares
WHERE user_id = $1
  AND reward_issued = TRUE
  AND created_at >= date_trunc('month', NOW());
```

---

## 4. Supabase 함수 (RPC)

### 4.1 코인 충전

```sql
CREATE OR REPLACE FUNCTION add_coins(
  p_user_id UUID,
  p_payment_id UUID,
  p_coins DECIMAL(10,2)
)
RETURNS DECIMAL(10,2) AS $$
DECLARE
  v_balance_before DECIMAL(10,2);
  v_balance_after DECIMAL(10,2);
BEGIN
  -- 현재 잔액 가져오기 (없으면 생성)
  INSERT INTO coin_balances (user_id, balance)
  VALUES (p_user_id, 0)
  ON CONFLICT (user_id) DO NOTHING;

  SELECT balance INTO v_balance_before
  FROM coin_balances WHERE user_id = p_user_id FOR UPDATE;

  v_balance_after := v_balance_before + p_coins;

  -- 잔액 업데이트
  UPDATE coin_balances
  SET balance = v_balance_after, updated_at = NOW()
  WHERE user_id = p_user_id;

  -- 거래 내역 기록
  INSERT INTO coin_transactions (user_id, type, amount, payment_id, balance_before, balance_after, description)
  VALUES (p_user_id, 'purchase', p_coins, p_payment_id, v_balance_before, v_balance_after, '코인 충전');

  RETURN v_balance_after;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 4.2 사주 결과 생성 (코인 차감)

```sql
CREATE OR REPLACE FUNCTION create_reading_with_coins(
  p_user_id UUID,
  p_type reading_type,
  p_person1_id UUID,
  p_person2_id UUID DEFAULT NULL,
  p_reward_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_reading_id UUID;
  v_transaction_id UUID;
  v_is_free BOOLEAN := FALSE;
  v_coins_required DECIMAL(10,2) := 1;
  v_balance DECIMAL(10,2);
  v_balance_after DECIMAL(10,2);
BEGIN
  -- 리워드 사용 시
  IF p_reward_id IS NOT NULL THEN
    UPDATE rewards
    SET status = 'used', used_at = NOW()
    WHERE id = p_reward_id
      AND user_id = p_user_id
      AND status = 'active'
      AND (expires_at IS NULL OR expires_at > NOW());

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Invalid or expired reward';
    END IF;

    v_is_free := TRUE;
    v_coins_required := 0;
  ELSE
    -- 잔액 확인
    SELECT balance INTO v_balance
    FROM coin_balances WHERE user_id = p_user_id FOR UPDATE;

    IF v_balance IS NULL OR v_balance < v_coins_required THEN
      RAISE EXCEPTION 'Insufficient coins. Required: %, Available: %', v_coins_required, COALESCE(v_balance, 0);
    END IF;

    v_balance_after := v_balance - v_coins_required;

    -- 코인 차감
    UPDATE coin_balances
    SET balance = v_balance_after, updated_at = NOW()
    WHERE user_id = p_user_id;

    -- 거래 내역
    INSERT INTO coin_transactions (user_id, type, amount, target, balance_before, balance_after, description)
    VALUES (p_user_id, 'spend', -v_coins_required, 'reading', v_balance, v_balance_after, p_type::TEXT || ' 사주')
    RETURNING id INTO v_transaction_id;
  END IF;

  -- Reading 생성
  INSERT INTO readings (user_id, type, person1_id, person2_id, coins_used, is_free, reward_id, transaction_id)
  VALUES (p_user_id, p_type, p_person1_id, p_person2_id, v_coins_required, v_is_free, p_reward_id, v_transaction_id)
  RETURNING id INTO v_reading_id;

  -- 거래 내역에 target_id 업데이트
  IF v_transaction_id IS NOT NULL THEN
    UPDATE coin_transactions SET target_id = v_reading_id WHERE id = v_transaction_id;
  END IF;

  -- 리워드에 사용된 reading 연결
  IF p_reward_id IS NOT NULL THEN
    UPDATE rewards SET used_reading_id = v_reading_id WHERE id = p_reward_id;
  END IF;

  RETURN v_reading_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 4.3 공유 후 리워드 발급

```sql
CREATE OR REPLACE FUNCTION issue_share_reward(
  p_user_id UUID,
  p_reading_id UUID,
  p_platform share_platform
)
RETURNS UUID AS $$
DECLARE
  v_share_id UUID;
  v_reward_id UUID;
  v_monthly_shares INT;
BEGIN
  -- 이번 달 리워드 발급 횟수 확인
  SELECT COUNT(*) INTO v_monthly_shares
  FROM shares
  WHERE user_id = p_user_id
    AND reward_issued = TRUE
    AND created_at >= date_trunc('month', NOW());

  -- 월 1회 제한
  IF v_monthly_shares >= 1 THEN
    -- 공유는 기록하되 리워드는 미발급
    INSERT INTO shares (user_id, reading_id, platform, reward_issued)
    VALUES (p_user_id, p_reading_id, p_platform, FALSE)
    RETURNING id INTO v_share_id;

    RETURN NULL;
  END IF;

  -- 리워드 생성
  INSERT INTO rewards (user_id, type, expires_at)
  VALUES (p_user_id, 'share', NOW() + INTERVAL '30 days')
  RETURNING id INTO v_reward_id;

  -- 공유 기록
  INSERT INTO shares (user_id, reading_id, platform, reward_issued, reward_id)
  VALUES (p_user_id, p_reading_id, p_platform, TRUE, v_reward_id)
  RETURNING id INTO v_share_id;

  RETURN v_reward_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 5. 마이그레이션 순서

1. ENUM 타입 생성
2. profiles 테이블
3. persons 테이블
4. coin_balances 테이블
5. coin_packages 테이블
6. payments 테이블
7. rewards 테이블
8. readings 테이블
9. shares 테이블
10. RPC 함수들
11. RLS 정책

---

## 6. 고려사항

### 6.1 개인정보 보호
- 생년월일시는 민감 정보 → Supabase Vault 활용 고려
- 필요시 암호화 컬럼 사용

### 6.2 성능
- 자주 조회되는 필드에 인덱스
- JSONB 필드 내 자주 조회되는 키에 GIN 인덱스 고려

### 6.3 확장성
- reading_type ENUM 확장 가능
- metadata JSONB 필드로 유연성 확보

---

## 7. reading_type 정의

| 타입 | 설명 | 필수 필드 |
|------|------|-----------|
| `personal` | 개인 사주 (인생 전체) | person1_id |
| `yearly` | 신년운세 (올해 월별) | person1_id, yearly_year |
| `compatibility` | 궁합 | person1_id, person2_id |
| `love` | 연애운 | person1_id |

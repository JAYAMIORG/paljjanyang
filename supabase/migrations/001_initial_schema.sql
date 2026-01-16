-- 팔자냥 Initial Schema
-- Run this in Supabase SQL Editor

-- ================================
-- 1. ENUM Types
-- ================================

CREATE TYPE reading_type AS ENUM ('personal', 'yearly', 'compatibility', 'love');
CREATE TYPE reading_status AS ENUM ('pending', 'processing', 'completed', 'failed');
CREATE TYPE transaction_type AS ENUM ('purchase', 'spend', 'reward', 'refund');
CREATE TYPE spend_target AS ENUM ('reading');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded', 'cancelled');
CREATE TYPE payment_method AS ENUM ('toss', 'kakao', 'card');
CREATE TYPE reward_type AS ENUM ('share', 'referral', 'promotion', 'other');
CREATE TYPE reward_status AS ENUM ('active', 'used', 'expired');
CREATE TYPE share_platform AS ENUM ('instagram', 'twitter', 'facebook', 'kakao', 'link');

-- ================================
-- 2. Tables
-- ================================

-- 2.1 profiles (사용자 프로필)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.2 persons (저장된 인물 정보)
CREATE TABLE persons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  relationship TEXT NOT NULL,
  birth_year INT NOT NULL,
  birth_month INT NOT NULL,
  birth_day INT NOT NULL,
  birth_hour INT,
  is_lunar BOOLEAN DEFAULT FALSE,
  is_leap_month BOOLEAN DEFAULT FALSE,
  gender TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_month CHECK (birth_month BETWEEN 1 AND 12),
  CONSTRAINT valid_day CHECK (birth_day BETWEEN 1 AND 31),
  CONSTRAINT valid_hour CHECK (birth_hour IS NULL OR birth_hour BETWEEN 0 AND 23),
  CONSTRAINT valid_gender CHECK (gender IN ('male', 'female')),
  CONSTRAINT valid_relationship CHECK (relationship IN ('self', 'partner', 'family', 'friend', 'other'))
);

CREATE INDEX idx_persons_user_id ON persons(user_id);

-- 2.3 coin_balances (코인 잔액)
CREATE TABLE coin_balances (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  balance DECIMAL(10,2) NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT positive_balance CHECK (balance >= 0)
);

-- 2.4 coin_packages (코인 패키지)
CREATE TABLE coin_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  coins DECIMAL(10,2) NOT NULL,
  price INT NOT NULL,
  bonus_coins DECIMAL(10,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 기본 패키지 데이터
INSERT INTO coin_packages (name, coins, price, bonus_coins, sort_order) VALUES
  ('1 코인', 1, 1500, 0, 1),
  ('5 코인', 5, 6500, 0.5, 2),
  ('10 코인', 10, 12000, 2, 3);

-- 2.5 payments (결제)
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INT NOT NULL,
  currency TEXT DEFAULT 'KRW',
  method payment_method,
  status payment_status DEFAULT 'pending',
  package_id UUID REFERENCES coin_packages(id),
  coins_purchased DECIMAL(10,2),
  external_payment_id TEXT,
  external_order_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  failure_reason TEXT,
  metadata JSONB
);

CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_external_id ON payments(external_payment_id);

-- 2.6 coin_transactions (코인 거래 내역)
CREATE TABLE coin_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type transaction_type NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_id UUID REFERENCES payments(id),
  target spend_target,
  target_id UUID,
  description TEXT,
  balance_before DECIMAL(10,2) NOT NULL,
  balance_after DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_coin_transactions_user_id ON coin_transactions(user_id);
CREATE INDEX idx_coin_transactions_created_at ON coin_transactions(created_at DESC);

-- 2.7 rewards (리워드/쿠폰)
CREATE TABLE rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type reward_type NOT NULL,
  status reward_status DEFAULT 'active',
  valid_for reading_type[],
  expires_at TIMESTAMPTZ,
  used_at TIMESTAMPTZ,
  used_reading_id UUID,
  source_share_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_rewards_user_id ON rewards(user_id);
CREATE INDEX idx_rewards_status ON rewards(status);

-- 2.8 readings (사주 결과)
CREATE TABLE readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type reading_type NOT NULL,
  status reading_status DEFAULT 'pending',
  person1_id UUID REFERENCES persons(id) ON DELETE SET NULL,
  person2_id UUID REFERENCES persons(id) ON DELETE SET NULL,
  person1_bazi JSONB,
  person1_wuxing JSONB,
  person1_day_master TEXT,
  person2_bazi JSONB,
  person2_wuxing JSONB,
  person2_day_master TEXT,
  compatibility_score INT,
  yearly_year INT,
  yearly_data JSONB,
  interpretation JSONB,
  korean_ganji TEXT,
  coins_used DECIMAL(10,2) DEFAULT 1,
  is_free BOOLEAN DEFAULT FALSE,
  reward_id UUID REFERENCES rewards(id),
  transaction_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  CONSTRAINT compatibility_requires_two CHECK (
    (type = 'compatibility' AND person2_id IS NOT NULL) OR
    (type != 'compatibility' AND person2_id IS NULL)
  ),
  CONSTRAINT yearly_requires_year CHECK (
    (type = 'yearly' AND yearly_year IS NOT NULL) OR
    (type != 'yearly')
  )
);

CREATE INDEX idx_readings_user_id ON readings(user_id);
CREATE INDEX idx_readings_created_at ON readings(created_at DESC);
CREATE INDEX idx_readings_type ON readings(type);

-- Update rewards FK now that readings exists
ALTER TABLE rewards ADD CONSTRAINT rewards_used_reading_id_fkey
  FOREIGN KEY (used_reading_id) REFERENCES readings(id);

-- 2.9 shares (공유 기록)
CREATE TABLE shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reading_id UUID NOT NULL REFERENCES readings(id) ON DELETE CASCADE,
  platform share_platform NOT NULL,
  reward_issued BOOLEAN DEFAULT FALSE,
  reward_id UUID REFERENCES rewards(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_shares_user_created ON shares(user_id, created_at);

-- ================================
-- 3. Row Level Security (RLS)
-- ================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE persons ENABLE ROW LEVEL SECURITY;
ALTER TABLE readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE coin_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE coin_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE shares ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- persons
CREATE POLICY "Users can CRUD own persons"
  ON persons FOR ALL
  USING (auth.uid() = user_id);

-- readings
CREATE POLICY "Users can view own readings"
  ON readings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own readings"
  ON readings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own readings"
  ON readings FOR UPDATE
  USING (auth.uid() = user_id);

-- coin_balances
CREATE POLICY "Users can view own balance"
  ON coin_balances FOR SELECT
  USING (auth.uid() = user_id);

-- coin_transactions
CREATE POLICY "Users can view own transactions"
  ON coin_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- payments
CREATE POLICY "Users can view own payments"
  ON payments FOR SELECT
  USING (auth.uid() = user_id);

-- rewards
CREATE POLICY "Users can view own rewards"
  ON rewards FOR SELECT
  USING (auth.uid() = user_id);

-- shares
CREATE POLICY "Users can CRUD own shares"
  ON shares FOR ALL
  USING (auth.uid() = user_id);

-- ================================
-- 4. Functions (RPC)
-- ================================

-- 4.1 코인 충전
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
  INSERT INTO coin_balances (user_id, balance)
  VALUES (p_user_id, 0)
  ON CONFLICT (user_id) DO NOTHING;

  SELECT balance INTO v_balance_before
  FROM coin_balances WHERE user_id = p_user_id FOR UPDATE;

  v_balance_after := v_balance_before + p_coins;

  UPDATE coin_balances
  SET balance = v_balance_after, updated_at = NOW()
  WHERE user_id = p_user_id;

  INSERT INTO coin_transactions (user_id, type, amount, payment_id, balance_before, balance_after, description)
  VALUES (p_user_id, 'purchase', p_coins, p_payment_id, v_balance_before, v_balance_after, '코인 충전');

  RETURN v_balance_after;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4.2 사주 결과 생성 (코인 차감)
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
    SELECT balance INTO v_balance
    FROM coin_balances WHERE user_id = p_user_id FOR UPDATE;

    IF v_balance IS NULL OR v_balance < v_coins_required THEN
      RAISE EXCEPTION 'Insufficient coins. Required: %, Available: %', v_coins_required, COALESCE(v_balance, 0);
    END IF;

    v_balance_after := v_balance - v_coins_required;

    UPDATE coin_balances
    SET balance = v_balance_after, updated_at = NOW()
    WHERE user_id = p_user_id;

    INSERT INTO coin_transactions (user_id, type, amount, target, balance_before, balance_after, description)
    VALUES (p_user_id, 'spend', -v_coins_required, 'reading', v_balance, v_balance_after, p_type::TEXT || ' 사주')
    RETURNING id INTO v_transaction_id;
  END IF;

  INSERT INTO readings (user_id, type, person1_id, person2_id, coins_used, is_free, reward_id, transaction_id)
  VALUES (p_user_id, p_type, p_person1_id, p_person2_id, v_coins_required, v_is_free, p_reward_id, v_transaction_id)
  RETURNING id INTO v_reading_id;

  IF v_transaction_id IS NOT NULL THEN
    UPDATE coin_transactions SET target_id = v_reading_id WHERE id = v_transaction_id;
  END IF;

  IF p_reward_id IS NOT NULL THEN
    UPDATE rewards SET used_reading_id = v_reading_id WHERE id = p_reward_id;
  END IF;

  RETURN v_reading_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4.3 공유 후 리워드 발급
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
  SELECT COUNT(*) INTO v_monthly_shares
  FROM shares
  WHERE user_id = p_user_id
    AND reward_issued = TRUE
    AND created_at >= date_trunc('month', NOW());

  IF v_monthly_shares >= 1 THEN
    INSERT INTO shares (user_id, reading_id, platform, reward_issued)
    VALUES (p_user_id, p_reading_id, p_platform, FALSE)
    RETURNING id INTO v_share_id;

    RETURN NULL;
  END IF;

  INSERT INTO rewards (user_id, type, expires_at)
  VALUES (p_user_id, 'share', NOW() + INTERVAL '30 days')
  RETURNING id INTO v_reward_id;

  INSERT INTO shares (user_id, reading_id, platform, reward_issued, reward_id)
  VALUES (p_user_id, p_reading_id, p_platform, TRUE, v_reward_id)
  RETURNING id INTO v_share_id;

  RETURN v_reward_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================
-- 5. Trigger: Auto-create profile on signup
-- ================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id);

  -- 코인 잔액 0으로 초기화
  INSERT INTO public.coin_balances (user_id, balance)
  VALUES (NEW.id, 0);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

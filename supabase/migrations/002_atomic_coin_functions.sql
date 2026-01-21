-- Race Condition 방지를 위한 Atomic 코인 처리 함수들
-- 실행 방법: Supabase Dashboard > SQL Editor에서 실행

-- 1. 코인 차감 함수 (사주 조회용)
CREATE OR REPLACE FUNCTION use_coin(
  p_user_id UUID,
  p_amount INT,
  p_description TEXT
) RETURNS TABLE(
  success BOOLEAN,
  new_balance INT,
  transaction_id UUID,
  error_message TEXT
) AS $$
DECLARE
  v_current_balance INT;
  v_new_balance INT;
  v_transaction_id UUID;
BEGIN
  -- Row-level lock으로 동시 접근 방지
  SELECT balance INTO v_current_balance
  FROM coin_balances
  WHERE user_id = p_user_id
  FOR UPDATE;

  -- 잔액 레코드가 없는 경우
  IF v_current_balance IS NULL THEN
    RETURN QUERY SELECT FALSE, 0, NULL::UUID, '코인 잔액 정보가 없습니다.'::TEXT;
    RETURN;
  END IF;

  -- 잔액 부족 확인
  IF v_current_balance < p_amount THEN
    RETURN QUERY SELECT FALSE, v_current_balance, NULL::UUID, '코인이 부족합니다.'::TEXT;
    RETURN;
  END IF;

  v_new_balance := v_current_balance - p_amount;

  -- 잔액 업데이트
  UPDATE coin_balances
  SET balance = v_new_balance, updated_at = NOW()
  WHERE user_id = p_user_id;

  -- 거래 내역 기록
  INSERT INTO coin_transactions (user_id, amount, type, description, balance_before, balance_after)
  VALUES (p_user_id, -p_amount, 'spend', p_description, v_current_balance, v_new_balance)
  RETURNING id INTO v_transaction_id;

  RETURN QUERY SELECT TRUE, v_new_balance, v_transaction_id, NULL::TEXT;
END;
$$ LANGUAGE plpgsql;


-- 2. 코인 추가 함수 (결제/보상용)
CREATE OR REPLACE FUNCTION add_coin(
  p_user_id UUID,
  p_amount INT,
  p_type TEXT,
  p_description TEXT,
  p_payment_id UUID DEFAULT NULL
) RETURNS TABLE(
  success BOOLEAN,
  new_balance INT,
  transaction_id UUID,
  error_message TEXT
) AS $$
DECLARE
  v_current_balance INT;
  v_new_balance INT;
  v_transaction_id UUID;
BEGIN
  -- Row-level lock으로 동시 접근 방지 (UPSERT 시에도)
  SELECT balance INTO v_current_balance
  FROM coin_balances
  WHERE user_id = p_user_id
  FOR UPDATE;

  -- 잔액 레코드가 없는 경우 새로 생성
  IF v_current_balance IS NULL THEN
    v_current_balance := 0;
    INSERT INTO coin_balances (user_id, balance, updated_at)
    VALUES (p_user_id, 0, NOW());
  END IF;

  v_new_balance := v_current_balance + p_amount;

  -- 잔액 업데이트
  UPDATE coin_balances
  SET balance = v_new_balance, updated_at = NOW()
  WHERE user_id = p_user_id;

  -- 거래 내역 기록
  INSERT INTO coin_transactions (user_id, amount, type, description, payment_id, balance_before, balance_after)
  VALUES (p_user_id, p_amount, p_type, p_description, p_payment_id, v_current_balance, v_new_balance)
  RETURNING id INTO v_transaction_id;

  RETURN QUERY SELECT TRUE, v_new_balance, v_transaction_id, NULL::TEXT;
END;
$$ LANGUAGE plpgsql;


-- 3. 결제 처리 함수 (결제 상태 변경 + 코인 추가를 atomic하게)
CREATE OR REPLACE FUNCTION process_payment(
  p_payment_id UUID,
  p_user_id UUID,
  p_external_payment_id TEXT DEFAULT NULL
) RETURNS TABLE(
  success BOOLEAN,
  new_balance INT,
  coins_added INT,
  error_message TEXT
) AS $$
DECLARE
  v_payment RECORD;
  v_current_balance INT;
  v_new_balance INT;
  v_coins_to_add INT;
BEGIN
  -- 결제 정보 조회 및 잠금
  SELECT * INTO v_payment
  FROM payments
  WHERE id = p_payment_id AND user_id = p_user_id AND status = 'pending'
  FOR UPDATE;

  IF v_payment IS NULL THEN
    RETURN QUERY SELECT FALSE, 0, 0, '결제 정보를 찾을 수 없거나 이미 처리되었습니다.'::TEXT;
    RETURN;
  END IF;

  v_coins_to_add := v_payment.coins_purchased;

  -- 결제 상태를 processing으로 변경 (중복 처리 방지)
  UPDATE payments
  SET status = 'processing', updated_at = NOW()
  WHERE id = p_payment_id;

  -- 코인 잔액 조회 및 잠금
  SELECT balance INTO v_current_balance
  FROM coin_balances
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF v_current_balance IS NULL THEN
    v_current_balance := 0;
    INSERT INTO coin_balances (user_id, balance, updated_at)
    VALUES (p_user_id, 0, NOW());
  END IF;

  v_new_balance := v_current_balance + v_coins_to_add;

  -- 잔액 업데이트
  UPDATE coin_balances
  SET balance = v_new_balance, updated_at = NOW()
  WHERE user_id = p_user_id;

  -- 거래 내역 기록
  INSERT INTO coin_transactions (user_id, amount, type, description, payment_id, balance_before, balance_after)
  VALUES (p_user_id, v_coins_to_add, 'purchase', '코인 충전', p_payment_id, v_current_balance, v_new_balance);

  -- 결제 완료 처리
  UPDATE payments
  SET status = 'completed',
      external_payment_id = COALESCE(p_external_payment_id, external_payment_id),
      completed_at = NOW(),
      updated_at = NOW()
  WHERE id = p_payment_id;

  RETURN QUERY SELECT TRUE, v_new_balance, v_coins_to_add, NULL::TEXT;
END;
$$ LANGUAGE plpgsql;


-- 4. 공유 보상 처리 함수 (중복 보상 방지)
CREATE OR REPLACE FUNCTION claim_share_reward(
  p_user_id UUID
) RETURNS TABLE(
  success BOOLEAN,
  new_balance INT,
  already_claimed BOOLEAN,
  error_message TEXT
) AS $$
DECLARE
  v_current_balance INT;
  v_new_balance INT;
  v_already_claimed BOOLEAN;
  v_reward_amount INT := 1;
BEGIN
  -- 프로필에서 보상 수령 여부 확인 및 잠금
  SELECT share_reward_claimed INTO v_already_claimed
  FROM profiles
  WHERE id = p_user_id
  FOR UPDATE;

  IF v_already_claimed IS NULL THEN
    RETURN QUERY SELECT FALSE, 0, FALSE, '프로필 정보를 찾을 수 없습니다.'::TEXT;
    RETURN;
  END IF;

  IF v_already_claimed THEN
    -- 이미 보상을 받은 경우
    SELECT balance INTO v_current_balance
    FROM coin_balances
    WHERE user_id = p_user_id;

    RETURN QUERY SELECT TRUE, COALESCE(v_current_balance, 0), TRUE, NULL::TEXT;
    RETURN;
  END IF;

  -- 코인 잔액 조회 및 잠금
  SELECT balance INTO v_current_balance
  FROM coin_balances
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF v_current_balance IS NULL THEN
    v_current_balance := 0;
    INSERT INTO coin_balances (user_id, balance, updated_at)
    VALUES (p_user_id, 0, NOW());
  END IF;

  v_new_balance := v_current_balance + v_reward_amount;

  -- 잔액 업데이트
  UPDATE coin_balances
  SET balance = v_new_balance, updated_at = NOW()
  WHERE user_id = p_user_id;

  -- 거래 내역 기록
  INSERT INTO coin_transactions (user_id, amount, type, description, balance_before, balance_after)
  VALUES (p_user_id, v_reward_amount, 'bonus', '공유 보상', v_current_balance, v_new_balance);

  -- 보상 수령 플래그 업데이트
  UPDATE profiles
  SET share_reward_claimed = TRUE, updated_at = NOW()
  WHERE id = p_user_id;

  RETURN QUERY SELECT TRUE, v_new_balance, FALSE, NULL::TEXT;
END;
$$ LANGUAGE plpgsql;


-- 5. 코인 환불 함수 (사주 계산 실패 시 롤백용)
CREATE OR REPLACE FUNCTION refund_coin(
  p_user_id UUID,
  p_amount INT,
  p_description TEXT
) RETURNS TABLE(
  success BOOLEAN,
  new_balance INT,
  transaction_id UUID,
  error_message TEXT
) AS $$
DECLARE
  v_current_balance INT;
  v_new_balance INT;
  v_transaction_id UUID;
BEGIN
  -- Row-level lock으로 동시 접근 방지
  SELECT balance INTO v_current_balance
  FROM coin_balances
  WHERE user_id = p_user_id
  FOR UPDATE;

  -- 잔액 레코드가 없는 경우
  IF v_current_balance IS NULL THEN
    v_current_balance := 0;
    INSERT INTO coin_balances (user_id, balance, updated_at)
    VALUES (p_user_id, 0, NOW());
  END IF;

  v_new_balance := v_current_balance + p_amount;

  -- 잔액 업데이트
  UPDATE coin_balances
  SET balance = v_new_balance, updated_at = NOW()
  WHERE user_id = p_user_id;

  -- 거래 내역 기록 (환불)
  INSERT INTO coin_transactions (user_id, amount, type, description, balance_before, balance_after)
  VALUES (p_user_id, p_amount, 'refund', p_description, v_current_balance, v_new_balance)
  RETURNING id INTO v_transaction_id;

  RETURN QUERY SELECT TRUE, v_new_balance, v_transaction_id, NULL::TEXT;
END;
$$ LANGUAGE plpgsql;

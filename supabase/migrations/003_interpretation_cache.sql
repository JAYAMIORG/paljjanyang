-- ================================================
-- LLM 해석 결과 캐싱 테이블
-- 동일한 사주 정보에 대해 캐시된 해석 결과 반환
-- ================================================

-- interpretation_cache 테이블 생성
CREATE TABLE IF NOT EXISTS interpretation_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 캐시 키 (SHA-256 해시)
  cache_key VARCHAR(64) UNIQUE NOT NULL,

  -- 사주 타입
  saju_type VARCHAR(20) NOT NULL CHECK (saju_type IN ('personal', 'yearly', 'love', 'compatibility', 'daily')),

  -- 사주 정보 (디버깅/관리용)
  bazi_year VARCHAR(10) NOT NULL,      -- 년주 (예: 乙亥)
  bazi_month VARCHAR(10) NOT NULL,     -- 월주
  bazi_day VARCHAR(10) NOT NULL,       -- 일주
  bazi_hour VARCHAR(10),               -- 시주 (nullable)
  gender VARCHAR(10) NOT NULL,         -- 성별

  -- 궁합용 두 번째 사람 정보 (optional)
  bazi2_year VARCHAR(10),
  bazi2_month VARCHAR(10),
  bazi2_day VARCHAR(10),
  bazi2_hour VARCHAR(10),
  gender2 VARCHAR(10),

  -- 해석 결과
  interpretation TEXT NOT NULL,

  -- 통계
  hit_count INT DEFAULT 1,

  -- 타임스탬프
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_hit_at TIMESTAMPTZ DEFAULT NOW()
);

-- 캐시 키 인덱스 (빠른 조회)
CREATE INDEX IF NOT EXISTS idx_interpretation_cache_key ON interpretation_cache(cache_key);

-- 사주 타입별 인덱스
CREATE INDEX IF NOT EXISTS idx_interpretation_cache_type ON interpretation_cache(saju_type);

-- 통계용 인덱스 (히트율 분석)
CREATE INDEX IF NOT EXISTS idx_interpretation_cache_stats ON interpretation_cache(hit_count DESC, last_hit_at DESC);

-- 캐시 조회 함수 (히트 카운트 자동 증가)
CREATE OR REPLACE FUNCTION get_cached_interpretation(p_cache_key VARCHAR(64))
RETURNS TABLE (
  interpretation TEXT,
  hit_count INT
) AS $$
DECLARE
  v_interpretation TEXT;
  v_hit_count INT;
BEGIN
  -- 캐시 조회 및 히트 카운트 증가 (한 번의 쿼리로)
  UPDATE interpretation_cache
  SET
    hit_count = interpretation_cache.hit_count + 1,
    last_hit_at = NOW()
  WHERE cache_key = p_cache_key
  RETURNING interpretation_cache.interpretation, interpretation_cache.hit_count
  INTO v_interpretation, v_hit_count;

  IF FOUND THEN
    RETURN QUERY SELECT v_interpretation, v_hit_count;
  END IF;

  RETURN;
END;
$$ LANGUAGE plpgsql;

-- 코멘트
COMMENT ON TABLE interpretation_cache IS 'LLM 해석 결과 캐시 - 동일 사주 정보에 대해 재사용';
COMMENT ON COLUMN interpretation_cache.cache_key IS 'SHA-256 해시 (bazi + gender + type 조합)';
COMMENT ON COLUMN interpretation_cache.hit_count IS '캐시 히트 횟수 (비용 절감 지표)';

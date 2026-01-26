-- =============================================
-- 캐시 초기화 마이그레이션
-- 마크다운 형식 캐시를 삭제하고 JSON 형식으로 새로 시작
-- =============================================

-- interpretation_cache 테이블의 모든 데이터 삭제
-- 새로운 JSON 형식으로 캐시가 다시 생성됨
DELETE FROM interpretation_cache;

-- readings 테이블의 interpretation 필드 중 마크다운 형식인 것들 삭제
-- (JSON 형식이 아닌 경우 삭제 - 새로 조회 시 JSON으로 재생성)
-- 주의: 이 쿼리는 구 마크다운 형식 해석만 삭제합니다
-- JSON은 { 로 시작하므로, # 또는 * 로 시작하는 것은 마크다운
UPDATE readings
SET interpretation = NULL
WHERE interpretation IS NOT NULL
  AND interpretation NOT LIKE '{%';

-- 분석: 삭제될 캐시 수 확인 (실행 전 테스트용)
-- SELECT COUNT(*) as cache_count FROM interpretation_cache;
-- SELECT COUNT(*) as markdown_readings FROM readings WHERE interpretation IS NOT NULL AND interpretation NOT LIKE '{%';

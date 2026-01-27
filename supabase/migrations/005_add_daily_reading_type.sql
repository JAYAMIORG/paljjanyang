-- reading_type ENUM에 'daily' 추가
-- 오늘의 운세 기능을 위한 마이그레이션

ALTER TYPE reading_type ADD VALUE IF NOT EXISTS 'daily';

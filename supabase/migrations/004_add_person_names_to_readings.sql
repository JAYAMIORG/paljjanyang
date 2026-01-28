-- readings 테이블에 person1_name, person2_name 컬럼 추가
-- 프로필 삭제 후에도 이름이 유지되도록 함

ALTER TABLE readings
ADD COLUMN IF NOT EXISTS person1_name TEXT,
ADD COLUMN IF NOT EXISTS person2_name TEXT;

-- 기존 데이터에 대해 persons 테이블에서 이름 복사
UPDATE readings r
SET person1_name = p.name
FROM persons p
WHERE r.person1_id = p.id
AND r.person1_name IS NULL;

UPDATE readings r
SET person2_name = p.name
FROM persons p
WHERE r.person2_id = p.id
AND r.person2_name IS NULL;

-- 인덱스 추가 (검색 성능 향상)
CREATE INDEX IF NOT EXISTS idx_readings_person1_name ON readings(person1_name);
CREATE INDEX IF NOT EXISTS idx_readings_person2_name ON readings(person2_name);

-- readings 테이블 DELETE 정책 추가
-- 사용자가 자신의 사주 기록을 삭제할 수 있도록 허용

CREATE POLICY "Users can delete own readings"
  ON readings FOR DELETE
  USING (auth.uid() = user_id);

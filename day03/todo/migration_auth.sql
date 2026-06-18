-- 인증 기능 추가를 위한 마이그레이션

-- 1. todos 테이블에 user_id 컬럼 추가
ALTER TABLE todos ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

-- 2. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_todos_user_id ON todos(user_id);

-- 3. 기존 RLS 정책 삭제
DROP POLICY IF EXISTS "Enable read access for all users" ON todos;
DROP POLICY IF EXISTS "Enable insert access for all users" ON todos;
DROP POLICY IF EXISTS "Enable update access for all users" ON todos;
DROP POLICY IF EXISTS "Enable delete access for all users" ON todos;

-- 4. 사용자 인증 기반 RLS 정책 생성
CREATE POLICY "Users can view own todos"
ON todos FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own todos"
ON todos FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own todos"
ON todos FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own todos"
ON todos FOR DELETE
USING (auth.uid() = user_id);

-- 5. 기존 데이터 정리 (선택사항)
-- user_id가 null인 기존 데이터 삭제
-- DELETE FROM todos WHERE user_id IS NULL;

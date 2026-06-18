-- todos 테이블 생성
CREATE TABLE todos (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  text text NOT NULL,
  completed boolean DEFAULT false,
  priority text CHECK (priority IN ('high', 'medium', 'low')) DEFAULT 'medium',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- updated_at 자동 업데이트 트리거 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- updated_at 트리거 생성
CREATE TRIGGER update_todos_updated_at
  BEFORE UPDATE ON todos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 인덱스 생성 (성능 최적화)
CREATE INDEX idx_todos_created_at ON todos(created_at DESC);
CREATE INDEX idx_todos_priority ON todos(priority);

-- RLS (Row Level Security) 활성화
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽기 가능
CREATE POLICY "Enable read access for all users"
ON todos FOR SELECT
USING (true);

-- 모든 사용자가 삽입 가능
CREATE POLICY "Enable insert access for all users"
ON todos FOR INSERT
WITH CHECK (true);

-- 모든 사용자가 수정 가능
CREATE POLICY "Enable update access for all users"
ON todos FOR UPDATE
USING (true);

-- 모든 사용자가 삭제 가능
CREATE POLICY "Enable delete access for all users"
ON todos FOR DELETE
USING (true);

# Supabase 연동 가이드

## 📋 개요
localStorage에서 Supabase로 데이터 저장소를 마이그레이션하여 클라우드 기반 Todo List 구현

## 🎯 Supabase 프로젝트 설정

### 1. 프로젝트 생성
1. [Supabase Dashboard](https://supabase.com/dashboard) 접속
2. "New Project" 클릭
3. 프로젝트 정보 입력:
   - Name: `todo-app` (또는 원하는 이름)
   - Database Password: 강력한 비밀번호 설정
   - Region: `Northeast Asia (Seoul)` 선택
   - Pricing Plan: Free tier 선택

### 2. API 키 확인
프로젝트 생성 후 Settings > API에서 확인:
- **Project URL**: `https://xxxxx.supabase.co`
- **anon/public key**: 클라이언트에서 사용할 공개 키

## 🗄️ 데이터베이스 테이블 구조

### `todos` 테이블

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PRIMARY KEY, DEFAULT uuid_generate_v4() | 고유 ID |
| `text` | text | NOT NULL | 할 일 내용 |
| `completed` | boolean | DEFAULT false | 완료 여부 |
| `priority` | text | CHECK (priority IN ('high', 'medium', 'low')), DEFAULT 'medium' | 우선순위 |
| `created_at` | timestamptz | DEFAULT now() | 생성 시간 |
| `updated_at` | timestamptz | DEFAULT now() | 수정 시간 |

### SQL 스크립트

```sql
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
```

## 🔒 Row Level Security (RLS) 설정

현재는 인증 없이 사용하므로 모든 사용자가 접근 가능하도록 설정:

```sql
-- RLS 활성화
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
```

⚠️ **주의**: 프로덕션 환경에서는 사용자 인증을 추가하고 RLS 정책을 수정해야 합니다.

## 📦 프론트엔드 통합

### 1. Supabase 클라이언트 라이브러리 추가

HTML에 CDN으로 추가:
```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
```

### 2. 환경 변수 설정

`config.js` 파일 생성 (gitignore에 추가):
```javascript
const SUPABASE_URL = 'https://xxxxx.supabase.co'
const SUPABASE_ANON_KEY = 'your-anon-key-here'
```

### 3. Supabase 클라이언트 초기화

```javascript
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
```

## 🔄 API 작업 매핑

| 작업 | localStorage | Supabase |
|------|-------------|----------|
| 전체 조회 | `JSON.parse(localStorage.getItem('todos'))` | `supabase.from('todos').select('*').order('created_at', { ascending: false })` |
| 추가 | `localStorage.setItem('todos', JSON.stringify(todos))` | `supabase.from('todos').insert([{ text, priority }])` |
| 수정 | `localStorage.setItem('todos', JSON.stringify(todos))` | `supabase.from('todos').update({ completed }).eq('id', id)` |
| 삭제 | `localStorage.setItem('todos', JSON.stringify(todos))` | `supabase.from('todos').delete().eq('id', id)` |

## 🚀 마이그레이션 단계

1. ✅ Supabase 프로젝트 생성
2. ✅ `todos` 테이블 생성 (SQL Editor에서 실행)
3. ✅ RLS 정책 설정
4. ⬜ HTML에 Supabase 라이브러리 추가
5. ⬜ `config.js` 생성 및 API 키 설정
6. ⬜ `script.js` 수정 (localStorage → Supabase API)
7. ⬜ 테스트 및 확인

## 🎁 향후 개선 사항

- 🔐 사용자 인증 추가 (Supabase Auth)
- 👥 사용자별 할 일 관리
- 🔄 실시간 동기화 (Supabase Realtime)
- 📱 PWA로 변환
- 🌐 다중 사용자 공유 기능

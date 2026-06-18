# 인증 기능 구현 가이드

## 📋 개요
Supabase Auth를 사용한 이메일 회원가입/로그인 기능 추가

## 🎯 구현 목표
- 이메일/비밀번호 회원가입
- 이메일 인증
- 로그인/로그아웃
- 사용자별 할 일 관리 (개인 데이터 격리)

## 🗄️ 데이터베이스 변경

### 1. todos 테이블에 user_id 추가
```sql
ALTER TABLE todos ADD COLUMN user_id uuid REFERENCES auth.users(id);
CREATE INDEX idx_todos_user_id ON todos(user_id);
```

### 2. RLS 정책 업데이트
기존 정책 삭제하고 사용자 인증 기반 정책으로 변경:
```sql
-- 기존 정책 삭제
DROP POLICY IF EXISTS "Enable read access for all users" ON todos;
DROP POLICY IF EXISTS "Enable insert access for all users" ON todos;
DROP POLICY IF EXISTS "Enable update access for all users" ON todos;
DROP POLICY IF EXISTS "Enable delete access for all users" ON todos;

-- 사용자 인증 기반 정책
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
```

## 📂 파일 구조

```
todo/
├── index.html          # Todo 앱 (인증 필요)
├── login.html          # 로그인 페이지
├── signup.html         # 회원가입 페이지
├── auth.js             # 인증 관련 로직
├── script.js           # Todo 로직 (user_id 포함)
├── style.css           # 공통 스타일
└── auth-style.css      # 인증 페이지 스타일
```

## 🔐 인증 흐름

### 회원가입
1. 사용자가 `signup.html`에서 이메일/비밀번호 입력
2. `supabase.auth.signUp()` 호출
3. Supabase가 인증 이메일 발송
4. 사용자가 이메일 링크 클릭하여 인증
5. 로그인 페이지로 리다이렉트

### 로그인
1. 사용자가 `login.html`에서 이메일/비밀번호 입력
2. `supabase.auth.signInWithPassword()` 호출
3. 성공 시 `index.html`로 리다이렉트
4. 실패 시 에러 메시지 표시

### 자동 로그인
1. 페이지 로드 시 `supabase.auth.getSession()` 체크
2. 세션 있으면 → Todo 앱 표시
3. 세션 없으면 → 로그인 페이지로 리다이렉트

### 로그아웃
1. `supabase.auth.signOut()` 호출
2. 로그인 페이지로 리다이렉트

## 🎨 UI 컴포넌트

### 로그인 페이지
- 이메일 입력
- 비밀번호 입력
- 로그인 버튼
- "계정이 없으신가요?" → 회원가입 링크

### 회원가입 페이지
- 이메일 입력
- 비밀번호 입력 (최소 6자)
- 비밀번호 확인
- 회원가입 버튼
- "이미 계정이 있으신가요?" → 로그인 링크

### Todo 앱 헤더
- 사용자 이메일 표시
- 로그아웃 버튼

## ⚙️ Supabase Dashboard 설정

### 1. Authentication 활성화
Dashboard → Authentication → Settings

### 2. Email Templates (선택사항)
Dashboard → Authentication → Email Templates
- Confirm signup: 회원가입 인증 이메일
- 필요시 커스터마이징 가능

### 3. Site URL 설정
Dashboard → Authentication → URL Configuration
- Site URL: `http://localhost:8000` (개발)
- Redirect URLs: `http://localhost:8000/index.html` 추가

## 🔧 구현 체크리스트

- [ ] `migration.sql` 실행 (user_id 컬럼 추가 + RLS)
- [ ] `auth.js` 생성 (인증 로직)
- [ ] `login.html` 생성
- [ ] `signup.html` 생성
- [ ] `auth-style.css` 생성
- [ ] `index.html` 수정 (인증 체크)
- [ ] `script.js` 수정 (user_id 포함)
- [ ] Supabase Email 설정 확인
- [ ] 테스트: 회원가입 → 이메일 인증 → 로그인 → Todo CRUD

## 🧪 테스트 시나리오

1. **회원가입**
   - [ ] 이메일 형식 검증
   - [ ] 비밀번호 6자 이상 검증
   - [ ] 회원가입 성공 메시지
   - [ ] 인증 이메일 수신

2. **로그인**
   - [ ] 잘못된 비밀번호 에러
   - [ ] 이메일 미인증 에러
   - [ ] 로그인 성공 후 리다이렉트

3. **Todo 기능**
   - [ ] 사용자 A의 할 일이 사용자 B에게 안 보임
   - [ ] 로그아웃 후 재로그인 시 데이터 유지
   - [ ] 다른 브라우저에서 동일 계정으로 로그인

## 🚨 주의사항

- **이메일 인증 필수**: Supabase는 기본적으로 이메일 인증을 요구합니다
- **개발 환경**: localhost에서 테스트 시 Supabase 설정에 URL 추가 필요
- **기존 데이터**: migration 전 기존 todos에는 user_id가 null이므로 삭제 또는 임시 user_id 할당 필요

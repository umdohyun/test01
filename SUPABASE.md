# Supabase 설정 가이드

이 문서는 칸반보드에 Supabase 인증을 연동하는 방법을 설명합니다.

---

## 1. Supabase 프로젝트 생성

### 1.1 계정 생성 및 프로젝트 생성

1. [Supabase](https://supabase.com) 방문
2. "Start your project" 클릭
3. GitHub 계정으로 로그인
4. "New project" 클릭
5. 프로젝트 정보 입력:
   - **Name**: `kanban-board` (또는 원하는 이름)
   - **Database Password**: 안전한 비밀번호 생성 및 저장
   - **Region**: `Northeast Asia (Seoul)` 선택
6. "Create new project" 클릭 (약 2분 소요)

### 1.2 API 키 확인

프로젝트 생성 후:
1. 좌측 메뉴에서 **Settings** (톱니바퀴 아이콘) 클릭
2. **API** 탭 선택
3. 다음 정보 복사:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGc...` (매우 긴 문자열)

---

## 2. 로컬 프로젝트 설정

### 2.1 config.js 파일 생성

```bash
cd /path/to/kanban
cp config.example.js config.js
```

### 2.2 config.js 파일 수정

`config.js` 파일을 열고 Supabase 정보 입력:

```javascript
const SUPABASE_CONFIG = {
    url: 'https://xxxxx.supabase.co',  // 실제 Project URL로 교체
    anonKey: 'eyJhbGc...'                // 실제 anon key로 교체
};
```

⚠️ **중요**: `config.js` 파일은 `.gitignore`에 포함되어 Git에 커밋되지 않습니다.

---

## 3. Authentication 설정

### 3.1 이메일 인증 활성화

1. Supabase 대시보드에서 **Authentication** 메뉴 클릭
2. **Providers** 탭 선택
3. **Email** 섹션에서:
   - "Enable Email provider" 체크
   - "Confirm email" 활성화 (선택 사항)
   - "Save" 클릭

### 3.2 GitHub OAuth 설정

#### Step 1: GitHub OAuth App 생성

1. [GitHub Developer Settings](https://github.com/settings/developers) 접속
2. "OAuth Apps" → "New OAuth App" 클릭
3. 정보 입력:
   - **Application name**: `Kanban Board`
   - **Homepage URL**: `http://localhost:8000` (개발) 또는 실제 배포 URL
   - **Authorization callback URL**: `https://xxxxx.supabase.co/auth/v1/callback`
     - ⚠️ Supabase Project URL에 `/auth/v1/callback` 추가
4. "Register application" 클릭
5. **Client ID** 복사
6. "Generate a new client secret" 클릭 → **Client Secret** 복사

#### Step 2: Supabase에 GitHub OAuth 연동

1. Supabase 대시보드 → **Authentication** → **Providers**
2. **GitHub** 섹션에서:
   - "Enable Sign in with GitHub" 체크
   - **Client ID** 입력
   - **Client Secret** 입력
   - "Save" 클릭

---

## 4. 데이터베이스 테이블 생성 (향후)

현재는 localStorage를 사용하지만, 향후 데이터베이스 연동 시 필요:

```sql
-- users 테이블 (Supabase Auth가 자동 생성)
-- auth.users 테이블 사용

-- boards 테이블
CREATE TABLE boards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- cards 테이블
CREATE TABLE cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('todo', 'in-progress', 'done')),
    position INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Row Level Security (RLS) 활성화
ALTER TABLE boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;

-- 정책 생성: 사용자는 자신의 보드만 볼 수 있음
CREATE POLICY "Users can view their own boards"
    ON boards FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own boards"
    ON boards FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own boards"
    ON boards FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own boards"
    ON boards FOR DELETE
    USING (auth.uid() = user_id);
```

---

## 5. 환경별 설정

### 5.1 개발 환경 (localhost)

- **Redirect URL**: `http://localhost:8000`
- **Site URL**: Supabase 대시보드 → Authentication → URL Configuration
  - "Site URL" 설정: `http://localhost:8000`

### 5.2 프로덕션 환경

배포 시 Supabase 설정 업데이트:

1. GitHub OAuth App에서 Homepage URL과 Callback URL을 실제 도메인으로 변경
2. Supabase → Authentication → URL Configuration:
   - "Site URL": `https://yourdomain.com`
   - "Redirect URLs": 허용할 도메인 추가

---

## 6. 인증 플로우

### 6.1 이메일/비밀번호 회원가입

```
사용자 → signup.html 접속
      → 이메일, 비밀번호 입력
      → Supabase.auth.signUp()
      → 이메일 확인 (선택)
      → 자동 로그인
      → index.html로 리디렉션
```

### 6.2 GitHub OAuth 로그인

```
사용자 → login.html 접속
      → "GitHub로 로그인" 버튼 클릭
      → GitHub 인증 페이지로 리디렉션
      → GitHub 계정 로그인 및 권한 승인
      → Supabase 콜백 URL로 리디렉션
      → 세션 토큰 발급
      → index.html로 리디렉션
```

### 6.3 세션 관리

- **Access Token**: 1시간 유효
- **Refresh Token**: 자동 갱신
- localStorage에 세션 저장
- 페이지 로드 시 세션 확인

---

## 7. 보안 고려사항

### 7.1 환경 변수
- `config.js`는 반드시 `.gitignore`에 포함
- GitHub에 절대 커밋하지 말 것

### 7.2 RLS (Row Level Security)
- 모든 테이블에 RLS 활성화
- 사용자는 자신의 데이터만 접근 가능

### 7.3 HTTPS
- 프로덕션 환경에서는 반드시 HTTPS 사용
- GitHub OAuth는 HTTPS 필수

---

## 8. 트러블슈팅

### 8.1 "Invalid API key" 오류
- `config.js`의 `anonKey`가 올바른지 확인
- Supabase 대시보드에서 키 재확인

### 8.2 GitHub OAuth 리디렉션 실패
- Callback URL이 정확한지 확인: `https://xxxxx.supabase.co/auth/v1/callback`
- GitHub OAuth App의 설정 확인

### 8.3 CORS 오류
- Supabase는 기본적으로 모든 origin 허용
- 문제 발생 시 Supabase 대시보드 → Settings → API → CORS 확인

### 8.4 이메일 확인 안 됨
- Supabase → Authentication → Email Templates 확인
- 스팸 폴더 확인
- 개발 환경에서는 이메일 확인 비활성화 권장

---

## 9. Supabase 클라이언트 사용법

### 9.1 초기화

```javascript
const supabase = window.supabase.createClient(
    SUPABASE_CONFIG.url,
    SUPABASE_CONFIG.anonKey
);
```

### 9.2 회원가입

```javascript
const { data, error } = await supabase.auth.signUp({
    email: 'user@example.com',
    password: 'securepassword123'
});
```

### 9.3 로그인

```javascript
const { data, error } = await supabase.auth.signInWithPassword({
    email: 'user@example.com',
    password: 'securepassword123'
});
```

### 9.4 GitHub OAuth

```javascript
const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
        redirectTo: window.location.origin
    }
});
```

### 9.5 로그아웃

```javascript
const { error } = await supabase.auth.signOut();
```

### 9.6 세션 확인

```javascript
const { data: { session } } = await supabase.auth.getSession();
if (session) {
    console.log('Logged in:', session.user.email);
} else {
    console.log('Not logged in');
}
```

---

## 10. 참고 자료

- [Supabase 공식 문서](https://supabase.com/docs)
- [Supabase Auth 가이드](https://supabase.com/docs/guides/auth)
- [GitHub OAuth Apps](https://docs.github.com/en/developers/apps/building-oauth-apps)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

---

## 문서 정보

- **작성일**: 2026-06-18
- **작성자**: Dohyun Um
- **버전**: 1.0
- **최종 수정일**: 2026-06-18

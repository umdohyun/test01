# 소셜 로그인 설정 가이드

## 📋 개요
Google과 GitHub OAuth를 사용한 소셜 로그인 구현

## 🎯 지원하는 소셜 로그인
- 🔵 Google
- 🐙 GitHub

## ⚙️ Supabase 설정

### 1. Google OAuth 설정

#### Google Cloud Console에서
1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 새 프로젝트 생성 (또는 기존 프로젝트 선택)
3. **APIs & Services** → **Credentials** 이동
4. **Create Credentials** → **OAuth 2.0 Client IDs**
5. Application type: **Web application**
6. Name: `Todo App`
7. **Authorized redirect URIs** 추가:
   ```
   https://fzjqgbidzniaeqxdfzci.supabase.co/auth/v1/callback
   ```
8. **Create** 클릭
9. **Client ID**와 **Client Secret** 복사 📋

#### Supabase Dashboard에서
1. **Authentication** → **Providers**
2. **Google** 클릭
3. **Enable Sign in with Google** 활성화
4. Google Cloud Console에서 복사한 값 입력:
   - **Client ID**: 붙여넣기
   - **Client Secret**: 붙여넣기
5. **Save** 클릭

---

### 2. GitHub OAuth 설정

#### GitHub에서
1. [GitHub Settings](https://github.com/settings/developers) 접속
2. **OAuth Apps** → **New OAuth App** 클릭
3. 정보 입력:
   - **Application name**: `Todo App`
   - **Homepage URL**: `http://localhost:8000`
   - **Authorization callback URL**:
     ```
     https://fzjqgbidzniaeqxdfzci.supabase.co/auth/v1/callback
     ```
4. **Register application** 클릭
5. **Client ID** 확인
6. **Generate a new client secret** 클릭
7. **Client Secret** 복사 📋

#### Supabase Dashboard에서
1. **Authentication** → **Providers**
2. **GitHub** 클릭
3. **Enable Sign in with GitHub** 활성화
4. GitHub에서 복사한 값 입력:
   - **Client ID**: 붙여넣기
   - **Client Secret**: 붙여넣기
5. **Save** 클릭

---

## 🔧 Redirect URL 설정

### Supabase Dashboard
**Authentication** → **URL Configuration**:
```
Site URL: http://localhost:8000

Redirect URLs:
- http://localhost:8000
- http://localhost:8000/index.html
- http://localhost:8000/login.html
- http://localhost:8000/callback.html
```

---

## 📂 구현된 파일

### 추가된 기능
- `auth.js`: `signInWithGoogle()`, `signInWithGithub()` 함수
- `login.html`: Google/GitHub 로그인 버튼
- `signup.html`: Google/GitHub 회원가입 버튼
- `callback.html`: OAuth 콜백 처리 페이지

---

## 🔄 소셜 로그인 플로우

### Google/GitHub 로그인
```
1. 사용자가 "Google로 로그인" 버튼 클릭
   ↓
2. Google 로그인 페이지로 리다이렉트
   ↓
3. 사용자 인증 및 권한 승인
   ↓
4. Supabase 콜백 URL로 리다이렉트
   ↓
5. callback.html에서 토큰 처리
   ↓
6. index.html (Todo 앱)으로 이동
```

### 첫 로그인 시
- 자동으로 Supabase에 사용자 계정 생성
- 이메일 인증 불필요
- 바로 Todo 앱 사용 가능

---

## 🎨 UI 변경사항

### 로그인 페이지
```
[이메일 로그인]

── 또는 ──

[Google로 로그인]  🔵
[GitHub로 로그인]  🐙

계정이 없으신가요? 회원가입
```

### 회원가입 페이지
```
[이메일 회원가입]

── 또는 ──

[Google로 시작하기]  🔵
[GitHub로 시작하기]  🐙

이미 계정이 있으신가요? 로그인
```

---

## 🧪 테스트 시나리오

### Google 로그인
- [ ] Google 버튼 클릭 → Google 로그인 페이지 표시
- [ ] Google 계정으로 로그인
- [ ] Todo 앱으로 리다이렉트
- [ ] 사용자 이메일 표시 (Google 계정 이메일)
- [ ] Todo CRUD 정상 작동

### GitHub 로그인
- [ ] GitHub 버튼 클릭 → GitHub 로그인 페이지 표시
- [ ] GitHub 계정으로 로그인
- [ ] Todo 앱으로 리다이렉트
- [ ] 사용자 이메일 표시 (GitHub 이메일)
- [ ] Todo CRUD 정상 작동

### 데이터 격리
- [ ] Google 계정으로 만든 할 일
- [ ] GitHub 계정으로 로그인 시 안 보임
- [ ] 이메일 계정과도 독립적

---

## 🚨 주의사항

### 개발 환경
- localhost:8000에서만 작동
- 다른 포트 사용 시 Redirect URL 변경 필요

### 프로덕션 배포
1. **Google Cloud Console**
   - Authorized redirect URIs에 프로덕션 URL 추가
   
2. **GitHub OAuth Apps**
   - Homepage URL과 Callback URL을 프로덕션 URL로 변경

3. **Supabase**
   - Site URL과 Redirect URLs에 프로덕션 도메인 추가

---

## 📊 Supabase Users 테이블

소셜 로그인 사용자 정보:
```json
{
  "id": "uuid",
  "email": "user@gmail.com",
  "app_metadata": {
    "provider": "google" // 또는 "github"
  },
  "user_metadata": {
    "avatar_url": "https://...",
    "full_name": "User Name"
  }
}
```

---

## 🔐 보안

### OAuth 2.0
- Client Secret은 서버 사이드에서만 사용 (Supabase가 처리)
- 사용자는 Google/GitHub에 비밀번호 노출 안 함
- Access Token은 Supabase가 관리

### RLS (Row Level Security)
- 소셜 로그인 사용자도 동일한 RLS 정책 적용
- `user_id`로 데이터 격리

---

## 💡 추가 기능 아이디어

### 프로필 사진 표시
```javascript
const { user } = await getCurrentUser();
const avatarUrl = user.user_metadata.avatar_url;
// 헤더에 프로필 사진 표시
```

### 소셜 연결 관리
- 이메일 계정에 Google/GitHub 연결
- 여러 소셜 계정 통합

### 이메일 없는 GitHub 계정
- GitHub 이메일이 공개되지 않은 경우 처리
- Primary email 요청

---

## 📚 참고 문서

- [Supabase OAuth 가이드](https://supabase.com/docs/guides/auth/social-login)
- [Google OAuth 설정](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [GitHub OAuth 설정](https://supabase.com/docs/guides/auth/social-login/auth-github)

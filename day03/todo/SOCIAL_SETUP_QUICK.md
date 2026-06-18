# 소셜 로그인 빠른 설정 가이드 ⚡

## ✅ 완료된 작업
- Google/GitHub 로그인 버튼 추가 (login.html, signup.html)
- OAuth 콜백 처리 페이지 (callback.html)
- 소셜 로그인 함수 (auth.js)
- 버튼 스타일 (auth-style.css)

## 🔧 Supabase 설정 (필수!)

### 1️⃣ Google OAuth 설정

#### Step 1: Google Cloud Console
1. https://console.cloud.google.com/ 접속
2. 프로젝트 생성 (또는 기존 선택)
3. **APIs & Services** → **Credentials**
4. **CREATE CREDENTIALS** → **OAuth client ID**
5. **Configure Consent Screen** (처음이면)
   - User Type: **External** 선택
   - App name: `Todo App`
   - User support email: 본인 이메일
   - Developer contact: 본인 이메일
   - **SAVE AND CONTINUE**
6. **Scopes** → Skip (기본값 사용)
7. **Test users** → Skip
8. 다시 **Credentials** → **CREATE CREDENTIALS** → **OAuth client ID**
9. Application type: **Web application**
10. Name: `Todo App`
11. **Authorized redirect URIs** 추가:
    ```
    https://fzjqgbidzniaeqxdfzci.supabase.co/auth/v1/callback
    ```
12. **CREATE**
13. ✅ **Client ID**와 **Client secret** 복사

#### Step 2: Supabase Dashboard
1. https://supabase.com/dashboard 접속
2. 프로젝트 선택
3. **Authentication** → **Providers**
4. **Google** 찾아서 클릭
5. **Enable Sign in with Google** 토글 ON
6. 복사한 값 입력:
   - **Client ID**: 붙여넣기
   - **Client Secret**: 붙여넣기
7. **Save**

---

### 2️⃣ GitHub OAuth 설정

#### Step 1: GitHub
1. https://github.com/settings/developers 접속
2. **OAuth Apps** → **New OAuth App**
3. 정보 입력:
   - **Application name**: `Todo App`
   - **Homepage URL**: `http://localhost:8000`
   - **Authorization callback URL**:
     ```
     https://fzjqgbidzniaeqxdfzci.supabase.co/auth/v1/callback
     ```
4. **Register application**
5. ✅ **Client ID** 확인
6. **Generate a new client secret**
7. ✅ **Client Secret** 복사 (한 번만 표시됨!)

#### Step 2: Supabase Dashboard
1. **Authentication** → **Providers**
2. **GitHub** 찾아서 클릭
3. **Enable Sign in with GitHub** 토글 ON
4. 복사한 값 입력:
   - **Client ID**: 붙여넣기
   - **Client Secret**: 붙여넣기
5. **Save**

---

### 3️⃣ Redirect URLs 설정

Supabase Dashboard → **Authentication** → **URL Configuration**:

```
Site URL:
http://localhost:8000

Redirect URLs (한 줄에 하나씩 추가):
http://localhost:8000
http://localhost:8000/index.html
http://localhost:8000/login.html
http://localhost:8000/callback.html
```

**Save** 클릭!

---

## 🧪 테스트

### 1. Google 로그인 테스트
```
1. http://localhost:8000/login.html 접속
2. "Google로 로그인" 버튼 클릭
3. Google 계정 선택
4. 권한 승인
5. ✅ callback.html → index.html로 자동 이동
6. ✅ 우측 상단에 Google 이메일 표시
7. ✅ Todo 추가/삭제 테스트
```

### 2. GitHub 로그인 테스트
```
1. http://localhost:8000/login.html 접속
2. "GitHub로 로그인" 버튼 클릭
3. GitHub 계정 로그인
4. 권한 승인 (Authorize)
5. ✅ callback.html → index.html로 자동 이동
6. ✅ 우측 상단에 GitHub 이메일 표시
7. ✅ Todo 추가/삭제 테스트
```

### 3. 데이터 격리 확인
```
1. Google 계정으로 로그인 → 할 일 추가
2. 로그아웃
3. GitHub 계정으로 로그인
4. ✅ Google 계정의 할 일이 안 보임 (정상)
```

---

## 🚨 문제 해결

### "Error: redirect_uri_mismatch"
→ Google Cloud Console의 Authorized redirect URIs를 확인
→ 정확히 `https://fzjqgbidzniaeqxdfzci.supabase.co/auth/v1/callback`인지 확인

### "Application not found" (GitHub)
→ GitHub OAuth App의 Callback URL 확인
→ 정확히 `https://fzjqgbidzniaeqxdfzci.supabase.co/auth/v1/callback`인지 확인

### 버튼 클릭해도 반응 없음
→ 브라우저 콘솔(F12) 확인
→ Supabase Provider에서 Enable 했는지 확인
→ Client ID/Secret이 올바른지 확인

### callback.html에서 오류
→ Supabase Redirect URLs에 `http://localhost:8000/callback.html` 추가했는지 확인

---

## 📊 설정 체크리스트

### Google
- [ ] Google Cloud Console에서 OAuth Client 생성
- [ ] Authorized redirect URIs 추가
- [ ] Client ID/Secret 복사
- [ ] Supabase Google Provider 활성화
- [ ] Supabase에 Client ID/Secret 입력

### GitHub
- [ ] GitHub OAuth App 생성
- [ ] Callback URL 설정
- [ ] Client ID/Secret 복사
- [ ] Supabase GitHub Provider 활성화
- [ ] Supabase에 Client ID/Secret 입력

### Supabase
- [ ] Site URL: `http://localhost:8000`
- [ ] Redirect URLs 4개 추가
- [ ] Google Provider 활성화
- [ ] GitHub Provider 활성화

---

## 🎯 완료 후 확인

브라우저에서:
```
http://localhost:8000/login.html
```

보여야 할 것:
- 📧 이메일/비밀번호 로그인
- ──── 또는 ────
- 🔵 **Google로 로그인** 버튼
- 🐙 **GitHub로 로그인** 버튼

클릭하면 → 각 서비스의 로그인 페이지로 이동! ✨

---

## 📝 참고

- 상세 가이드: [SOCIAL_LOGIN.md](./SOCIAL_LOGIN.md)
- Google OAuth: https://console.cloud.google.com/apis/credentials
- GitHub OAuth: https://github.com/settings/developers
- Supabase Auth: https://supabase.com/dashboard

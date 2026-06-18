# 이메일 인증 설정 가이드

## 🚨 문제: 이메일 인증 링크 클릭 시 오류

이메일 인증 링크를 클릭하면 localhost로 리다이렉트되면서 오류가 발생하는 경우

## ✅ 해결 방법

### 방법 1: Supabase URL 설정 (개발 환경용)

#### 1단계: Supabase Dashboard 설정
1. [Supabase Dashboard](https://supabase.com/dashboard) 접속
2. 프로젝트 선택
3. **Settings** → **Authentication** 클릭

#### 2단계: Site URL 설정
**Authentication Settings** 페이지에서:
```
Site URL: http://localhost:8000
```

#### 3단계: Redirect URLs 추가
**Redirect URLs** 섹션에서 다음 URL들을 추가:
```
http://localhost:8000
http://localhost:8000/login.html
http://localhost:8000/index.html
http://localhost:8000/signup.html
```

**Save** 버튼 클릭!

#### 4단계: 이메일 템플릿 수정 (선택사항)
**Email Templates** → **Confirm signup** 에서:

기본 템플릿의 링크 부분을 수정:
```html
<a href="{{ .SiteURL }}/login.html?token_hash={{ .TokenHash }}&type=email">Confirm your email</a>
```

### 방법 2: 개발 중 이메일 인증 비활성화 (빠른 테스트용)

⚠️ **주의**: 프로덕션에서는 반드시 이메일 인증을 활성화해야 합니다!

#### Supabase Dashboard 설정
1. **Settings** → **Authentication**
2. **Email Auth** 섹션에서:
   - ✅ **Enable email provider** 체크 유지
   - ❌ **Confirm email** 체크 해제 (개발용)
3. **Save** 클릭

이렇게 하면 이메일 인증 없이 바로 회원가입 후 로그인 가능합니다.

### 방법 3: 이메일 인증 처리 페이지 추가 (권장)

인증 완료 후 처리할 전용 페이지를 만듭니다.

#### confirm.html 생성
```html
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>이메일 인증 중...</title>
    <link rel="stylesheet" href="auth-style.css">
</head>
<body>
    <div class="auth-container">
        <div class="auth-card">
            <div class="auth-header">
                <h1 class="auth-title">
                    <span class="emoji">✨</span>
                    이메일 인증 중
                    <span class="emoji">🌸</span>
                </h1>
            </div>
            <div id="message" class="success-message show">
                이메일 인증을 처리하고 있습니다...
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    <script src="config.js"></script>
    <script>
        const { createClient } = supabase;
        const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        const message = document.getElementById('message');

        async function handleEmailConfirmation() {
            try {
                // URL에서 토큰 추출
                const params = new URLSearchParams(window.location.search);
                const token_hash = params.get('token_hash');
                const type = params.get('type');

                if (token_hash && type) {
                    // 토큰 검증
                    const { data, error } = await supabaseClient.auth.verifyOtp({
                        token_hash,
                        type: 'email'
                    });

                    if (error) throw error;

                    message.textContent = '✅ 이메일 인증이 완료되었습니다! 로그인 페이지로 이동합니다...';
                    
                    setTimeout(() => {
                        window.location.href = 'login.html';
                    }, 2000);
                } else {
                    // 이미 인증된 경우 세션 확인
                    const { data: { session } } = await supabaseClient.auth.getSession();
                    
                    if (session) {
                        message.textContent = '✅ 이미 인증되었습니다. Todo 앱으로 이동합니다...';
                        setTimeout(() => {
                            window.location.href = 'index.html';
                        }, 2000);
                    } else {
                        message.classList.remove('success-message');
                        message.classList.add('error-message');
                        message.textContent = '❌ 인증 토큰이 유효하지 않습니다. 다시 시도해주세요.';
                        
                        setTimeout(() => {
                            window.location.href = 'signup.html';
                        }, 3000);
                    }
                }
            } catch (error) {
                console.error('인증 처리 실패:', error);
                message.classList.remove('success-message');
                message.classList.add('error-message');
                message.textContent = '❌ 인증 처리 중 오류가 발생했습니다: ' + error.message;
                
                setTimeout(() => {
                    window.location.href = 'signup.html';
                }, 3000);
            }
        }

        handleEmailConfirmation();
    </script>
</body>
</html>
```

#### Supabase 이메일 템플릿 수정
**Email Templates** → **Confirm signup**:
```html
<a href="{{ .SiteURL }}/confirm.html?token_hash={{ .TokenHash }}&type=email">Confirm your email</a>
```

#### Redirect URLs에 추가
```
http://localhost:8000/confirm.html
```

## 🧪 테스트 방법

### 1. URL 설정 후 테스트
```bash
# 1. Supabase Dashboard에서 URL 설정
# 2. 새로운 이메일로 회원가입
# 3. 이메일 확인
# 4. Confirm 링크 클릭
# 5. 정상적으로 리다이렉트 확인
```

### 2. 수동 인증 (테스트용)
Supabase Dashboard에서 수동으로 사용자 인증:
1. **Authentication** → **Users**
2. 해당 사용자 찾기
3. 우측 **...** 메뉴 클릭
4. **Confirm email** 선택

## 📋 체크리스트

- [ ] Supabase Site URL 설정: `http://localhost:8000`
- [ ] Redirect URLs 추가:
  - [ ] `http://localhost:8000`
  - [ ] `http://localhost:8000/login.html`
  - [ ] `http://localhost:8000/index.html`
  - [ ] `http://localhost:8000/confirm.html` (방법 3 사용 시)
- [ ] 이메일 템플릿 수정 (선택)
- [ ] 개발 중 이메일 인증 비활성화 (선택)
- [ ] confirm.html 생성 (방법 3 사용 시)

## 🚀 프로덕션 배포 시 주의사항

GitHub Pages 또는 다른 호스팅으로 배포할 때:

### Site URL 변경
```
개발: http://localhost:8000
프로덕션: https://yourdomain.com
```

### Redirect URLs 추가
```
https://yourdomain.com
https://yourdomain.com/login.html
https://yourdomain.com/index.html
https://yourdomain.com/confirm.html
```

### 환경별 설정 분리 (권장)
```javascript
// config.js
const isDevelopment = window.location.hostname === 'localhost';

const SUPABASE_URL = 'https://fzjqgbidzniaeqxdfzci.supabase.co';
const SUPABASE_ANON_KEY = 'your-key';

// Supabase 클라이언트 생성 시 옵션 추가
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        redirectTo: isDevelopment 
            ? 'http://localhost:8000/confirm.html'
            : 'https://yourdomain.com/confirm.html'
    }
});
```

## 💡 추천 방법

**개발 중**: 방법 2 (이메일 인증 비활성화) - 빠른 테스트
**프로덕션**: 방법 1 + 방법 3 조합 - 안전하고 UX 좋음

## 🔗 참고 링크

- [Supabase Auth 문서](https://supabase.com/docs/guides/auth)
- [이메일 인증 가이드](https://supabase.com/docs/guides/auth/auth-email)
- [Redirect URLs 설정](https://supabase.com/docs/guides/auth/redirect-urls)

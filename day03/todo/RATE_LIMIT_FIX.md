# Email Rate Limit 해결 가이드

## 🚨 문제: "email rate limit exceeded"

개발 중 여러 번 회원가입 테스트를 하다 보면 Supabase의 이메일 전송 제한에 걸립니다.

## 📊 Supabase 이메일 제한

| 플랜 | 시간당 제한 | 일일 제한 |
|------|------------|----------|
| Free | ~3-4개 | 제한적 |
| Pro | 설정 가능 | 높음 |

## ✅ 즉시 해결 방법

### 1. 개발 중 이메일 인증 비활성화 (추천 ⭐)

**Supabase Dashboard:**
1. **Authentication** 클릭
2. 왼쪽 메뉴 **Providers** 클릭
3. **Email** 클릭
4. **Confirm email** 체크 해제
5. **Save** 클릭

**효과:**
- ✅ 이메일 인증 없이 바로 회원가입 가능
- ✅ Rate Limit 걱정 없음
- ✅ 빠른 테스트 가능

**주의:**
- ⚠️ 프로덕션 배포 전 다시 활성화 필요

---

### 2. 기존 테스트 계정 정리

**Supabase Dashboard:**
1. **Authentication** → **Users**
2. 테스트로 만든 계정들 선택
3. 우측 **...** 메뉴 → **Delete user**

**그 후:**
- 5-10분 기다리기 (Rate Limit 리셋)
- 새로운 이메일로 재시도

---

### 3. 다른 이메일 사용

임시 이메일 서비스 사용:
- [Temp Mail](https://temp-mail.org/)
- [Guerrilla Mail](https://www.guerrillamail.com/)
- Gmail: `yourname+test1@gmail.com`, `yourname+test2@gmail.com`

**Gmail Trick:**
- `test@gmail.com`
- `test+1@gmail.com`
- `test+2@gmail.com`

모두 같은 Gmail로 수신되지만 Supabase는 다른 이메일로 인식!

---

## 🔧 장기 해결 방법

### 옵션 1: 자체 SMTP 서버 사용

**Gmail SMTP 설정:**

1. **Google 계정 설정**
   - 2단계 인증 활성화
   - 앱 비밀번호 생성

2. **Supabase Dashboard**
   - **Settings** → **Authentication**
   - **SMTP Settings** 활성화
   - SMTP 정보 입력:
     ```
     Host: smtp.gmail.com
     Port: 587
     Username: your-email@gmail.com
     Password: [앱 비밀번호]
     ```

**장점:**
- ✅ Rate Limit 없음
- ✅ 커스텀 이메일 템플릿
- ✅ 안정적

**단점:**
- ⚠️ 설정 복잡
- ⚠️ Gmail 계정 필요

---

### 옵션 2: Pro 플랜 업그레이드

**Supabase Pro:**
- 이메일 제한 대폭 증가
- Rate Limit 커스터마이징 가능
- 월 $25

---

## 🎯 개발 단계별 추천

### 개발 초기 (현재)
→ **이메일 인증 비활성화**
- 빠른 테스트
- Rate Limit 걱정 없음

### 프로토타입 완성
→ **이메일 인증 활성화 + 테스트 계정 몇 개만**
- 실제 플로우 테스트
- 계정 재사용

### 프로덕션 배포
→ **이메일 인증 필수 + 자체 SMTP (선택)**
- 보안 강화
- 안정적인 이메일 전송

---

## 🧪 현재 상황에서 바로 하기

**1분 안에 해결:**

```
1. Supabase Dashboard 접속
2. Authentication → Providers → Email
3. "Confirm email" 체크 해제
4. Save
5. signup.html에서 회원가입 재시도
```

이제 이메일 인증 없이 바로:
- 회원가입 → 로그인 → Todo 사용 가능! ✨

---

## 💡 팁

### 테스트 계정 관리
```javascript
// 테스트용 이메일 패턴
const testEmails = [
  'test+1@example.com',
  'test+2@example.com',
  'test+3@example.com',
];
```

### 개발/프로덕션 분리
```javascript
// config.js
const isDevelopment = window.location.hostname === 'localhost';

// 개발 환경에서는 이메일 인증 안내 스킵
if (isDevelopment) {
  console.log('개발 모드: 이메일 인증 비활성화 권장');
}
```

---

## 📚 참고

- [Supabase Rate Limits](https://supabase.com/docs/guides/platform/going-into-prod#rate-limiting-resource-allocation--abuse-prevention)
- [SMTP 설정 가이드](https://supabase.com/docs/guides/auth/auth-smtp)

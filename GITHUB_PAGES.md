# GitHub Pages 배포 가이드

## 🌐 배포 URL

배포 완료 후 접속 가능한 URL:
```
https://weable-kosa.github.io/kosa-vibecoding-2026-3rd/src/exercise/umdohy/day03/kanban/
```

---

## 🚀 배포 방법

### Step 1: GitHub 저장소 설정

1. **GitHub 저장소 접속**
   - https://github.com/weable-kosa/kosa-vibecoding-2026-3rd

2. **Settings 탭 클릭**
   - 저장소 상단 메뉴에서 `Settings` 클릭

3. **Pages 메뉴 선택**
   - 왼쪽 사이드바에서 `Pages` 클릭

4. **Source 설정**
   - **Branch**: `main` 선택
   - **Folder**: `/ (root)` 선택
   - `Save` 버튼 클릭

5. **배포 대기**
   - 1-2분 후 페이지 새로고침
   - 상단에 배포 URL 표시됨

---

### Step 2: config.js 커밋 (완료됨)

✅ `.gitignore`에서 `config.js` 제거 완료  
✅ `config.js`에 안전성 주석 추가 완료

---

### Step 3: Git 커밋 & Push

```bash
git add .gitignore config.js GITHUB_PAGES.md
git commit -m "feat: GitHub Pages 배포 설정"
git push
```

---

## 🔐 보안 안내

### Supabase anon key 공개가 안전한 이유

1. **Row Level Security (RLS)**
   - 각 사용자는 본인의 데이터만 접근 가능
   - SQL 정책으로 강제 적용

2. **Supabase 공식 권장 사항**
   - anon key는 클라이언트 앱에 포함해도 안전
   - 공식 문서: https://supabase.com/docs/guides/api#api-keys

3. **실제 보안 구조**
   ```
   클라이언트 (anon key)
   ↓
   Supabase API Gateway
   ↓
   RLS 정책 검증 ← 여기서 권한 체크!
   ↓
   PostgreSQL Database
   ```

4. **절대 노출 금지**
   - ❌ `service_role` key (관리자 권한)
   - ✅ `anon` key (공개 가능)

---

## 📊 배포 확인

### 1. 배포 상태 확인

**GitHub Actions 탭**:
- 저장소 상단 `Actions` 탭 클릭
- `pages-build-deployment` 워크플로우 확인
- 초록색 체크 표시 = 배포 성공 ✅

### 2. 페이지 접속

배포 완료 후:
```
https://weable-kosa.github.io/kosa-vibecoding-2026-3rd/src/exercise/umdohy/day03/kanban/
```

### 3. 기능 테스트

- ✅ 로그인 페이지 표시
- ✅ 이메일/GitHub OAuth 작동
- ✅ 칸반보드 로딩
- ✅ 카드 CRUD 작동
- ✅ 실시간 동기화 작동 (여러 탭)

---

## 🐛 트러블슈팅

### 1. 404 Not Found

**원인**: GitHub Pages가 아직 활성화 안됨

**해결**:
1. Settings > Pages 확인
2. Branch가 `main`으로 설정되었는지 확인
3. 5분 정도 대기 후 재시도

---

### 2. 페이지는 뜨는데 로그인 안됨

**원인**: Supabase Redirect URL 미설정

**해결**:
1. Supabase Dashboard 접속
2. Authentication > URL Configuration
3. **Site URL** 추가:
   ```
   https://weable-kosa.github.io/kosa-vibecoding-2026-3rd/src/exercise/umdohy/day03/kanban/
   ```
4. **Redirect URLs** 추가 (GitHub OAuth용):
   ```
   https://weable-kosa.github.io/kosa-vibecoding-2026-3rd/src/exercise/umdohy/day03/kanban/
   https://weable-kosa.github.io/kosa-vibecoding-2026-3rd/src/exercise/umdohy/day03/kanban/index.html
   ```
5. `Save` 버튼 클릭

---

### 3. Supabase 연결 오류

**원인**: CORS 또는 config.js 로딩 실패

**해결**:
1. 브라우저 콘솔(F12) 확인
2. `SUPABASE_CONFIG` 로딩 확인:
   ```javascript
   console.log(SUPABASE_CONFIG);
   ```
3. CORS 에러 시: Supabase Dashboard에서 허용 도메인 추가

---

### 4. 실시간 동기화 안됨

**원인**: Realtime SQL 미실행

**해결**:
1. Supabase Dashboard > SQL Editor
2. `realtime_setup.sql` 실행
3. 페이지 새로고침

---

## 🔄 업데이트 방법

코드 수정 후 배포:

```bash
# 1. 코드 수정
vim script.js

# 2. Git 커밋
git add .
git commit -m "fix: 버그 수정"
git push

# 3. 자동 배포 (1-2분 소요)
# GitHub Actions가 자동으로 배포
```

배포 확인:
- GitHub > Actions 탭에서 진행 상황 확인
- 초록색 체크 표시 후 페이지 새로고침

---

## 📱 모바일 테스트

GitHub Pages URL을 모바일에서 접속:
1. QR 코드 생성: https://www.qr-code-generator.com/
2. URL 입력: `https://weable-kosa.github.io/...`
3. 스마트폰으로 QR 코드 스캔
4. 모바일 브라우저에서 테스트

---

## 🌟 GitHub Pages 장점

### 1. 무료 호스팅
- 저장소당 1GB
- 월 100GB 대역폭
- 무제한 방문자

### 2. HTTPS 자동
- Let's Encrypt SSL 인증서
- 안전한 연결

### 3. CDN 배포
- GitHub CDN으로 전세계 빠른 속도

### 4. 자동 배포
- `git push`만 하면 자동 배포
- CI/CD 파이프라인 불필요

---

## 📊 배포 후 체크리스트

### 필수
- [ ] GitHub Pages 활성화 완료
- [ ] 배포 URL 접속 가능
- [ ] 로그인 페이지 정상 표시
- [ ] Supabase Redirect URL 설정

### 기능 테스트
- [ ] 이메일 로그인 작동
- [ ] GitHub OAuth 로그인 작동
- [ ] 카드 추가/수정/삭제 작동
- [ ] 실시간 동기화 작동 (두 개 탭)
- [ ] 모바일에서 접속 가능

### 성능
- [ ] 페이지 로딩 속도 3초 이내
- [ ] 이미지/스크립트 로딩 정상
- [ ] 콘솔 에러 없음

---

## 🔗 관련 링크

- **GitHub Pages 공식 문서**: https://docs.github.com/pages
- **Supabase URL 설정**: https://supabase.com/docs/guides/auth/redirect-urls
- **배포 저장소**: https://github.com/weable-kosa/kosa-vibecoding-2026-3rd

---

**작성일**: 2026-06-18  
**배포 방식**: GitHub Pages (Option B - config.js 공개)  
**URL**: https://weable-kosa.github.io/kosa-vibecoding-2026-3rd/src/exercise/umdohy/day03/kanban/

# GitHub Pages 배포 가이드

## 📋 개요
Todo List 앱을 GitHub Pages로 배포하여 온라인에서 접근 가능하게 만드는 방법

## 🌐 GitHub Pages란?
GitHub에서 제공하는 무료 정적 웹사이트 호스팅 서비스입니다.
- **무료**: 공개 저장소는 완전 무료
- **HTTPS**: 자동 HTTPS 지원
- **커스텀 도메인**: 원하는 도메인 연결 가능

## 🚀 배포 방법

### 방법 1: 저장소 설정으로 배포 (추천)

#### 1. GitHub 저장소 설정
1. GitHub에서 저장소 페이지 접속
2. **Settings** 탭 클릭
3. 왼쪽 메뉴에서 **Pages** 클릭

#### 2. Source 설정
- **Source**: `Deploy from a branch` 선택
- **Branch**: `main` 선택
- **Folder**: `/ (root)` 선택
- **Save** 클릭

#### 3. 배포 확인
- 몇 분 후 페이지 상단에 배포된 URL이 표시됩니다
- 예: `https://weable-kosa.github.io/kosa-vibecoding-2026-3rd/`

#### 4. Todo 앱 접근
전체 URL은 다음과 같습니다:
```
https://weable-kosa.github.io/kosa-vibecoding-2026-3rd/src/exercise/umdohy/day02/todo/
```

### 방법 2: GitHub Actions로 자동 배포

#### 1. Workflow 파일 생성
`.github/workflows/deploy.yml` 파일 생성:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./src/exercise/umdohy/day02/todo
```

#### 2. Settings에서 Source 변경
- **Settings** → **Pages**
- **Source**: `gh-pages` branch 선택

## ⚙️ Supabase 설정 (중요!)

GitHub Pages에 배포할 때 **config.js 파일을 포함해야** 합니다.

### 옵션 1: config.js를 저장소에 포함 (공개 프로젝트)
```bash
# .gitignore에서 config.js 제거
git rm --cached .gitignore
# .gitignore 수정 (config.js 줄 삭제)
git add .gitignore config.js
git commit -m "Add config.js for GitHub Pages deployment"
git push
```

⚠️ **주의**: Supabase anon key는 공개되어도 안전하도록 설계되었지만, RLS 정책을 반드시 설정해야 합니다.

### 옵션 2: 환경 변수 사용 (더 안전)

`config.js` 대신 HTML에 직접 포함:

```html
<script>
  // GitHub Pages에서는 환경 변수를 사용할 수 없으므로
  // 빌드 시점에 값을 주입하거나, 직접 입력합니다
  const SUPABASE_URL = 'https://fzjqgbidzniaeqxdfzci.supabase.co'
  const SUPABASE_ANON_KEY = 'your-anon-key-here'
</script>
```

### 옵션 3: Netlify/Vercel 사용 (추천)
환경 변수를 지원하는 다른 호스팅 서비스 사용:
- **Netlify**: 환경 변수 지원, 자동 배포
- **Vercel**: 환경 변수 지원, 빠른 배포
- **Cloudflare Pages**: 무료 플랜, 환경 변수 지원

## 📱 배포 후 테스트

### 1. 기본 기능 확인
- [ ] 할 일 추가
- [ ] 할 일 완료 체크
- [ ] 할 일 삭제
- [ ] 우선순위 변경

### 2. 모바일 반응형 확인
- [ ] 스마트폰에서 접속
- [ ] 태블릿에서 접속
- [ ] 다양한 화면 크기 테스트

### 3. 데이터 동기화 확인
- [ ] 다른 기기에서 접속 시 동일한 데이터 표시
- [ ] 한 기기에서 수정 후 다른 기기에서 새로고침

## 🔒 보안 고려사항

### Supabase Row Level Security (RLS)
공개 배포 시 반드시 RLS 정책을 강화해야 합니다:

```sql
-- 기존 정책 삭제
DROP POLICY IF EXISTS "Enable read access for all users" ON todos;
DROP POLICY IF EXISTS "Enable insert access for all users" ON todos;
DROP POLICY IF EXISTS "Enable update access for all users" ON todos;
DROP POLICY IF EXISTS "Enable delete access for all users" ON todos;

-- 사용자 인증 기반 정책 추가 (추후 구현 시)
CREATE POLICY "Users can view their own todos"
ON todos FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own todos"
ON todos FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own todos"
ON todos FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own todos"
ON todos FOR DELETE
USING (auth.uid() = user_id);
```

## 🎨 커스텀 도메인 설정 (선택사항)

### 1. 도메인 구매
- Namecheap, GoDaddy, Cloudflare 등에서 구매

### 2. DNS 설정
CNAME 레코드 추가:
```
Type: CNAME
Name: todo (또는 원하는 서브도메인)
Value: weable-kosa.github.io
```

### 3. GitHub Pages 설정
- **Settings** → **Pages** → **Custom domain**
- 도메인 입력 후 **Save**

## 📊 배포 URL 정리

| 환경 | URL |
|------|-----|
| 로컬 개발 | `http://localhost:8000/index.html` |
| GitHub Pages | `https://weable-kosa.github.io/kosa-vibecoding-2026-3rd/src/exercise/umdohy/day02/todo/` |
| 커스텀 도메인 (예시) | `https://todo.yourdomain.com` |

## 🔄 업데이트 방법

코드 수정 후:
```bash
git add .
git commit -m "Update feature"
git push origin main
```

GitHub Pages는 자동으로 최신 버전을 배포합니다 (1-2분 소요).

## 🐛 트러블슈팅

### 문제 1: 404 Not Found
- GitHub Pages 설정이 올바른지 확인
- Branch와 Folder 설정 확인
- URL 경로가 정확한지 확인

### 문제 2: Supabase 연결 실패
- `config.js` 파일이 배포되었는지 확인
- 브라우저 콘솔에서 에러 확인
- Supabase URL과 Key가 올바른지 확인

### 문제 3: CORS 에러
- Supabase Dashboard → Settings → API
- **Allowed Origins**에 GitHub Pages URL 추가

### 문제 4: 스타일이 깨짐
- CSS 파일 경로가 상대 경로인지 확인
- 개발자 도구(F12) → Network 탭에서 로딩 실패 확인

## 📚 참고 자료
- [GitHub Pages 공식 문서](https://docs.github.com/en/pages)
- [Supabase 공식 문서](https://supabase.com/docs)
- [Material Design 가이드](https://material.io/design)

# GitHub Pages 배포 가이드

## 전제 조건
- GitHub 계정
- Git 설치

---

## 1단계: 새 GitHub 저장소 생성

1. [github.com](https://github.com) 로그인
2. 우측 상단 `+` → **New repository** 클릭
3. 설정:
   - **Repository name**: `tetris` (원하는 이름)
   - **Visibility**: `Public` ← 반드시 Public으로 설정
   - `Add a README file` 체크 해제
4. **Create repository** 클릭

---

## 2단계: 로컬에서 저장소 초기화 및 업로드

터미널에서 `tetris/` 폴더로 이동 후 아래 명령 실행:

```bash
cd /path/to/tetris

# git 초기화
git init

# 파일 추가 (plan.md, deploy.md, github_pages.md 등 문서 포함)
git add index.html game.html style.css game.js

# 첫 커밋
git commit -m "Initial commit: Tetris MVP"

# GitHub 저장소 연결 (YOUR_USERNAME을 본인 GitHub ID로 교체)
git remote add origin https://github.com/YOUR_USERNAME/tetris.git

# main 브랜치로 업로드
git branch -M main
git push -u origin main
```

---

## 3단계: GitHub Pages 활성화

1. GitHub 저장소 페이지 → **Settings** 탭
2. 좌측 메뉴 **Pages** 클릭
3. **Source** 섹션:
   - Branch: `main`
   - Folder: `/ (root)`
4. **Save** 클릭

---

## 4단계: 배포 확인

- 저장 후 1~3분 대기
- 배포 완료 시 Pages 설정 화면에 URL 표시:

```
https://YOUR_USERNAME.github.io/tetris/
```

- 이 URL을 공유하면 누구나 브라우저에서 바로 플레이 가능

---

## 이후 수정 사항 반영 방법

파일을 수정한 뒤 아래 명령으로 다시 push하면 자동으로 재배포됩니다.

```bash
git add index.html game.html style.css game.js
git commit -m "업데이트 내용 설명"
git push
```

재배포는 보통 1분 이내에 완료됩니다.

---

## 참고: 배포되는 파일 구조

```
저장소 루트/
├── index.html    ← 랜딩 페이지 (진입점)
├── game.html     ← 게임 페이지
├── style.css
└── game.js
```

`index.html`이 루트에 있으므로 별도 경로 설정 없이 바로 접속됩니다.

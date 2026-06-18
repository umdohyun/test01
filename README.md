# 📚 Dohyun Um - KOSA Vibe Coding 2026 (3rd)

**개인 백업 저장소** - 코사 바이브코딩 2026년 3기 과정 실습 코드 모음

## 📂 프로젝트 구조

```
.
├── day01/           # 1일차 실습
├── day02/           # 2일차 실습
└── day03/           # 3일차 실습
    ├── kanban/      # 칸반보드 (Supabase DB + Realtime)
    └── photo-album/ # 사진 앨범 (Supabase Storage)
```

---

## 📅 Day 01 - 기초 실습

### 프로젝트 목록
- **personal_landing**: 개인 랜딩 페이지
- **clock.html**: 실시간 시계
- **fibonacci.py**: 피보나치 수열
- **pi.py**: 원주율 계산
- **tetris.py**: 테트리스 게임 (Pygame)
- **tetris_console.py**: 콘솔 테트리스

### 기술 스택
- HTML, CSS, JavaScript
- Python 3

---

## 📅 Day 02 - Docker 및 웹 개발

### 주요 내용
- Docker 설치 및 기본 사용법
- 컨테이너화된 애플리케이션 배포

### 기술 스택
- Docker
- Shell Script

---

## 📅 Day 03 - 풀스택 애플리케이션

### 1. 🎯 칸반보드 (Kanban Board)

**Live Demo**: https://umdohyun.github.io/test01/day03/kanban/

#### 주요 기능
- ✅ 드래그 앤 드롭 카드 이동 (HTML5 Drag & Drop API)
- ✅ 3개 컬럼: 할 일, 진행중, 완료
- ✅ 이메일/GitHub OAuth 인증 (Supabase Auth)
- ✅ 실시간 동기화 (Supabase Realtime WebSocket)
- ✅ 클라우드 데이터베이스 (Supabase PostgreSQL)
- ✅ 반응형 디자인 (Desktop/Tablet/Mobile)

#### 기술 스택
- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Backend**: Supabase
  - Authentication (Email + GitHub OAuth)
  - PostgreSQL Database (RLS 보안)
  - Realtime (WebSocket)
- **Deployment**: GitHub Pages

#### 아키텍처
```
User Action
  → Supabase API (boardApi.js)
  → PostgreSQL Database
  → Realtime WebSocket
  → 다른 브라우저 자동 갱신
```

#### 주요 파일
- `index.html`: 칸반보드 메인 화면
- `login.html`, `signup.html`: 인증 페이지
- `script.js`: 칸반보드 로직 (CRUD, 드래그앤드롭)
- `boardApi.js`: Supabase CRUD API 레이어
- `realtime.js`: Realtime 구독 및 이벤트 처리
- `auth.js`: 인증 모듈
- `migration.sql`: 데이터베이스 스키마

#### 설치 방법
1. Supabase 프로젝트 생성
2. `migration.sql` 실행 (SQL Editor)
3. `realtime_setup.sql` 실행
4. GitHub OAuth 설정 (Supabase Dashboard)
5. `config.js` 설정 (URL, anon key)
6. 로컬 서버 실행: `python3 -m http.server 8000`

---

### 2. 📸 사진 앨범 (Photo Album)

#### 주요 기능
- ✅ 날짜별 자동 앨범 그룹화 (YYYY-MM-DD)
- ✅ 드래그 앤 드롭 앨범 재배치
- ✅ 타일형 미리보기 (최대 4장)
- ✅ 실제 파일 업로드 (Supabase Storage)
- ✅ 전체 화면 사진 뷰어 (prev/next 네비게이션)
- ✅ 사진 삭제 (Storage + DB 동시)
- ✅ 개인 저장소 (RLS 보안)

#### 기술 스택
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Supabase
  - Authentication (칸반보드와 공유)
  - PostgreSQL Database
  - Storage (이미지 파일)
- **Storage 구조**: `photos/{userId}/{timestamp}_{random}.{ext}`

#### 주요 파일
- `index.html`: 앨범 메인 페이지
- `script.js`: 앨범 로직 (날짜별 그룹화, 드래그앤드롭)
- `storage.js`: Supabase Storage API 레이어
- `migration.sql`: photos, user_settings 테이블 스키마

#### 설치 방법
1. Supabase 프로젝트 생성 (칸반보드와 동일)
2. `migration.sql` 실행
3. Storage에서 "photos" 버킷 생성 (Public)
4. 로컬 서버 실행: `python3 -m http.server 8000`

---

## 🛠️ 공통 기술 스택

### Frontend
- HTML5 (Semantic tags, Drag & Drop API)
- CSS3 (Flexbox, Grid, Animations)
- Vanilla JavaScript (ES6+)
  - Async/await
  - Fetch API
  - LocalStorage

### Backend (Supabase)
- **Authentication**: Email, GitHub OAuth
- **Database**: PostgreSQL + RLS
- **Realtime**: WebSocket (칸반보드)
- **Storage**: S3-compatible storage (사진 앨범)

### Tools
- Git (merge only, no rebase)
- Python HTTP Server
- GitHub Pages

---

## 📖 문서

각 프로젝트 폴더에 상세 문서가 포함되어 있습니다:

### 칸반보드 문서
- `CLAUDE.md`: 프로젝트 개요 및 개발 가이드
- `WORKFLOW.md`: 전체 개발 과정 기록
- `SUPABASE.md`: Supabase 설정 가이드
- `GITHUB_PAGES.md`: GitHub Pages 배포 가이드
- `docs/PRD.md`: 제품 요구사항 정의서
- `docs/TRD.md`: 기술 요구사항 정의서
- `docs/DATABASE_DESIGN.md`: 데이터베이스 설계
- `docs/DESIGN_SYSTEM.md`: 디자인 시스템

### 사진 앨범 문서
- `README.md`: 프로젝트 가이드
- `migration.sql`: 데이터베이스 스키마

---

## 🚀 실행 방법

### 칸반보드
```bash
cd day03/kanban
python3 -m http.server 8000
# http://localhost:8000
```

### 사진 앨범
```bash
cd day03/photo-album
python3 -m http.server 8000
# http://localhost:8000
```

---

## 📝 개발 원칙

### Git 규칙
- ✅ 항상 `git merge` 사용
- ❌ `git rebase` 금지

### 코드 컨벤션
- Vanilla JavaScript (프레임워크 없음)
- Semantic HTML5
- CSS 변수 사용
- XSS 방지 (`escapeHtml`)

### 보안
- Supabase RLS 정책으로 사용자별 격리
- anon key는 공개 가능 (RLS로 보호)
- 민감한 데이터는 환경변수로 관리

---

## 📊 프로젝트 통계

### 칸반보드
- **파일 수**: 25개 (코드 10개, 문서 13개, SQL 2개)
- **코드 라인**: ~3,500줄
- **문서 크기**: ~160KB
- **커밋 수**: 20+ commits

### 사진 앨범
- **파일 수**: 8개
- **코드 라인**: ~2,063줄
- **문서 크기**: ~20KB

### 전체
- **총 파일**: 33개
- **총 코드**: ~5,563줄
- **개발 기간**: 3일 (2026-06-16 ~ 2026-06-18)

---

## 👤 Author

**Dohyun Um** (umdohy)
- GitHub: [@umdohyun](https://github.com/umdohyun)
- 코사 바이브코딩 2026년 3기

---

## 🙏 Acknowledgments

- [Supabase](https://supabase.com) - Backend as a Service
- [Claude Sonnet 4.5](https://claude.ai) - Development Assistant
- 코사(KOSA) 바이브코딩 강사님 및 팀원들

---

## 📌 참고사항

- 이 저장소는 강사님 저장소([weable-kosa/kosa-vibecoding-2026-3rd](https://github.com/weable-kosa/kosa-vibecoding-2026-3rd))의 개인 백업입니다.
- 원본 저장소가 삭제되더라도 개인 참고용으로 유지됩니다.
- 모든 프로젝트는 교육 목적으로 제작되었습니다.

---

**Last Updated**: 2026-06-18

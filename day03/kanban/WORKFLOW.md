# 칸반보드 개발 워크플로우
## Development Workflow

이 문서는 칸반보드 프로젝트의 개발 과정에서 실행된 모든 프롬프트와 작업을 시간순으로 기록합니다.

---

## 2026-06-18 개발 세션

### 1. 칸반보드 초기 구현

**프롬프트:**
```
HTML과 CSS, JS로 칸반보드를 만들려고 해. 칸반보드에는 To-do, In-progress, Done의 컬럼이 있어야해. 
카드를 드래그해서 컬럼 간 이동이 가능하게 만들어야해. HTML과 CSS, JS는 각각 다른 파일로 저장해줘. 
플랜모드로 계획을 세워줘
```

**작업 요약:**
- Plan 모드 진입 및 구현 계획 수립
- `index.html`: 3개 컬럼 구조, 카드 추가 섹션
- `style.css`: Flexbox 레이아웃, 드래그 상태 스타일, 반응형 디자인
- `script.js`: HTML5 Drag & Drop API, localStorage 연동, CRUD 함수
- 초기 샘플 카드 4개 생성
- XSS 방지 (`escapeHtml` 함수)

**결과:** 기본 칸반보드 완성 (보라색 계열 색상)

---

### 2. 여름 테마로 색상 변경

**프롬프트:**
```
칸반보드의 색을 좀 더 여름느낌나게 가능할까? 시원한 느낌이 들면 더 좋고
```

**작업 요약:**
- 배경 그라데이션: 보라색 → 청록색/스카이블루 (`#06beb6` → `#48b1bf` → `#87ceeb`)
- 컬럼 헤더: 민트 그라데이션 (`#e0f7f6` → `#b2ebf2`)
- 강조 색상: 시안 블루 (`#00bcd4`)로 통일
- 모든 primary 색상을 시원한 청록 계열로 변경

**결과:** 여름 느낌의 시원한 색상 테마 적용

---

### 3. Git 커밋 (v1.0)

**프롬프트:**
```
좋아. 칸반보드 관련 데이터를 git 에 commit & push해줘
```

**작업 요약:**
- 11개 파일 커밋: `index.html`, `style.css`, `script.js`, `CLAUDE.md`, `docs/*.md` (7개)
- 커밋 메시지: "feat: Add summer-themed kanban board with drag-and-drop"
- 1,320줄 추가
- Git merge로 충돌 해결 후 push

**결과:** 기본 칸반보드 GitHub에 업로드 완료

---

### 4. 설계 문서 생성

**프롬프트:**
```
아까 알려준 plan.md? 계획을 plan.md에 정리하고. plan.md에 근거해서 다음 설계 문서들을 생성하고 저장해줘. 
PRD, TRD, User Flow, Database Design, Design System, TASKS. 현재는 백엔드 DBMS가 없지만 MySql이느 PostgreSQL 같은 
RDB를 연동할 수 있으니 그점을 고려해서 Database Design 문서를 만들어주고, 모든 문서는 md로 저장해줘.
```

**작업 요약:**
- `docs/PLAN.md`: 구현 계획 및 기술 스택
- `docs/PRD.md`: 제품 요구사항 정의서 (사용자 스토리, KPI)
- `docs/TRD.md`: 기술 요구사항 정의서 (API 설계, 함수 스펙)
- `docs/USER_FLOW.md`: 사용자 플로우 다이어그램 (27KB)
- `docs/DATABASE_DESIGN.md`: PostgreSQL/MySQL ERD 및 스키마 (24KB)
- `docs/DESIGN_SYSTEM.md`: 색상, 타이포그래피, 컴포넌트 가이드 (17KB)
- `docs/TASKS.md`: 작업 체크리스트 및 향후 로드맵

**결과:** 7개 전문적인 설계 문서 생성 (총 ~100KB)

---

### 5. CLAUDE.md 생성 및 Git 규칙 반영

**프롬프트:**
```
/init 아 그리고 CLAUDE.md에 다음 내용 반영해줘. git은 항상 merge, rebase 금지. 이 폴더의 상위 폴더는 읽지마!
```

**작업 요약:**
- `CLAUDE.md` 생성: 프로젝트 개요, 아키텍처, 실행 방법
- Git 규칙 명시: **ALWAYS use merge, NEVER rebase**
- 폴더 제한: **Do NOT read parent directories**
- 디자인 시스템, 테스트 방법 문서화

**결과:** Claude Code 작업 가이드 완성

---

### 6. Supabase 인증 기능 추가

**프롬프트:**
```
추가적으로 github , 그리고 이메일로 회원가입하고 인증할 수 있게 추가해줘. 
회원가입 및 인증은 supabase의 기능을 사용할거야. 만들어진 설계문서들을 알맞게 업데이트하면서 작업해줘.
```

**작업 요약:**
- 6개 작업 태스크 생성 (TaskCreate)
- **Task #1**: Supabase 설정
  - `.gitignore`: config.js 보호
  - `config.example.js`: 템플릿
  - `SUPABASE.md`: 상세 설정 가이드 (8KB)
- **Task #2**: 인증 UI
  - `login.html`: 로그인 페이지 (7.5KB)
  - `signup.html`: 회원가입 페이지 (9KB)
- **Task #3**: 인증 로직
  - `auth.js`: Supabase 인증 모듈 (6.9KB)
  - 10개 함수: signup, login, loginWithGithub, logout, getSession, getCurrentUser, checkAuth, etc.
- **Task #4**: 칸반보드 통합
  - `index.html`: 사용자 정보 헤더 추가
  - `script.js`: 인증 체크 및 리디렉션
  - `style.css`: 헤더 스타일
- **Task #5**: 문서 업데이트
  - `CLAUDE.md`: 인증 설정 추가
  - `docs/PRD.md`: v1.1 기능 추가
  - `docs/TASKS.md`: Phase 8 작업 내역
- **Task #6**: 테스트 및 커밋
  - 12개 파일 커밋 (신규 6개, 수정 6개)
  - 1,320줄 추가

**결과:** 이메일/GitHub OAuth 인증 시스템 완성

---

### 7. Supabase Config 설정

**프롬프트:**
```
cp config.example.js config.js 복사 하고 URL하고 anon key 넣어줘. 
URL은 https://fzjqgbidzniaeqxdfzci.supabase.co 이고 
anon key는 sb_publishable_rFFQzqu7158GJV9HUPv7zQ_6_zuQPY2 야
```

**작업 요약:**
- `config.js` 생성 및 Supabase 자격증명 입력
- URL과 anon key 설정

**결과:** Supabase 연결 설정 완료

---

### 8. Anon Key 수정

**프롬프트:**
```
아 미안해 anon key좀 바꿔주라 
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6anFnYmlkem5pYWVxeGRmemNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2NzEzMTQsImV4cCI6MjA5NzI0NzMxNH0.6Kq_uYmGRyQHhQhuPhWHF3DhGGeWSj4Y9ehfONuubgs
```

**작업 요약:**
- `config.js`의 anon key를 올바른 JWT 형식으로 업데이트

**결과:** 올바른 JWT 토큰으로 수정 완료

---

### 9. 인증 오류 수정 (여러 단계)

**오류 1: 중복 선언 오류**
```
Uncaught SyntaxError: Identifier 'supabase' has already been declared
```

**작업 요약:**
- `auth.js`: `let` → `var` 변경 및 초기화 체크 추가
- 커밋: "fix: Prevent duplicate supabase variable declaration"

---

**오류 2: 함수 미정의 오류**
```
Uncaught ReferenceError: checkAuth is not defined
Uncaught ReferenceError: loginWithGithub is not defined
```

**작업 요약:**
- `signup.html`, `login.html`: `window.addEventListener('load')` 추가
- 스크립트 로드 완료 후 함수 실행하도록 수정
- 커밋: "fix: Wait for scripts to load before executing auth functions"

---

**오류 3: Supabase 초기화 실패**
```
Cannot read properties of undefined (reading 'getSession')
Cannot read properties of undefined (reading 'signUp')
```

**작업 요약:**
- `auth.js` 완전 재작성: IIFE 패턴 사용
- 모든 함수에 null 체크 추가
- 상세한 에러 메시지 추가
- 커밋: "fix: Completely rewrite auth.js with IIFE pattern"

---

**오류 4: GitHub OAuth provider 비활성화**
```
{"code":400,"error_code":"validation_failed","msg":"Unsupported provider: provider is not enabled"}
```

**작업 요약:**
- GitHub OAuth 버튼 임시 주석 처리
- 이메일 로그인으로 먼저 테스트
- 사용자가 Supabase에서 GitHub provider 활성화 확인
- 커밋: "fix: Comment out GitHub OAuth buttons until provider is enabled"

---

### 10. 최종 커밋 (v1.1 - Authentication)

**프롬프트:**
```
아주 좋아. github로도 로그인 잘 됬어. 이제 git에 commit & push 해줘
```

**작업 요약:**
- GitHub OAuth 버튼 재활성화
- 최종 테스트 완료 확인
- 커밋 메시지: "feat: Re-enable GitHub OAuth buttons - authentication fully working"
- 모든 인증 기능 정상 작동 확인

**결과:** ✅ 이메일/GitHub OAuth 인증 시스템 완전 구현 완료

---

### 11. 워크플로우 문서화 (현재)

**프롬프트:**
```
지금까지 내가 전달한 프롬포트와 그에 상응해서 네가 작업한 작업을 정리해서 WORKFLOW.md에 정리해줘. 
프롬포트는 그대로 써야하고, 작업은 요약해서 써주면 돼. 이 내용을 CLAUDE.md에 반영해서 앞으로는 
작업 시 항상 WORKFLOW.md를 갱신하게 해줘
```

**작업 요약:**
- `WORKFLOW.md` 생성: 전체 개발 과정 문서화
- `CLAUDE.md` 업데이트: 워크플로우 문서화 규칙 추가

**결과:** 개발 과정 투명성 확보 및 재현 가능성 향상

---

### 12. Phase 1: 데이터베이스 기초 구현

**프롬프트:**
```
먼저B로 차근차근 단계별로 진행해보자
```

**작업 요약:**
- `migration.sql` 생성: Supabase 테이블 스키마 작성
  - `boards` 테이블: 보드 정보 (user_id, title, description)
  - `cards` 테이블: 카드 데이터 (board_id, title, status, position)
  - `board_members` 테이블: 보드 공유 멤버 (Phase 3에서 사용)
  - RLS (Row Level Security) 정책 설정
  - 자동 업데이트 트리거 추가
- `boardApi.js` 생성: Supabase CRUD API 레이어
  - `getOrCreateDefaultBoard()`: 기본 보드 생성/조회
  - `fetchCards()`: 카드 목록 조회
  - `createCard()`: 카드 생성
  - `updateCardStatus()`: 카드 상태 변경
  - `deleteCard()`: 카드 삭제
  - `migrateFromLocalStorage()`: localStorage → Supabase 마이그레이션
- `script.js` 수정: localStorage → Supabase API 전환
  - `loadCards()`: 비동기 함수로 변경, Supabase에서 데이터 로드
  - `addCard()`: API 호출로 변경
  - `deleteCardFromUI()`: API 호출로 변경 (함수명 충돌 해결)
  - `updateCardStatusAsync()`: API 호출로 변경
  - 초기화 로직: 보드 생성 및 자동 마이그레이션 추가
- `index.html` 수정: `boardApi.js` 스크립트 추가
- `PHASE1_SETUP.md` 생성: Phase 1 설치 가이드 (9.5KB)

**결과:** ✅ localStorage → Supabase PostgreSQL 마이그레이션 완료, 클라우드 기반 데이터 저장

---

### 13. Phase 2: 실시간 동기화 구현

**프롬프트:**
```
아니야 확인 위치를 알고싶었어. 잘 확인햇어. 이제 Option B를 수행하고 그 다음에 일어난 일들을 Option A를 통해 저장 및 기록하자.
```

**작업 요약:**
- `realtime.js` 생성: Supabase Realtime 구독 레이어
  - `subscribeToBoard()`: Realtime 채널 생성 및 구독
  - `handleRealtimeEvent()`: INSERT/UPDATE/DELETE 이벤트 처리
  - `unsubscribeFromBoard()`: 구독 해제
  - `reconnectRealtime()`: 재연결 로직
  - `formatCard()`: Supabase 레코드 포맷 변환
- `script.js` 수정: Realtime 이벤트 핸들러 추가
  - `handleRealtimeCardChange()`: 실시간 카드 변경 처리
  - `showNotification()`: 토스트 알림 표시 (3초 자동 사라짐)
  - 중복 방지 로직 (ID 체크)
  - Realtime 구독 시작 코드 추가
- `style.css` 수정: 토스트 알림 스타일
  - `.realtime-notification`: 우측 상단 고정 위치
  - `slideIn` 애니메이션: 우측에서 슬라이드 인
  - `fadeOut` 애니메이션: 페이드 아웃
- `index.html` 수정: `realtime.js` 스크립트 추가
- `realtime_setup.sql` 생성: Realtime 활성화 SQL
  - `ALTER TABLE cards REPLICA IDENTITY FULL`: Realtime 활성화
  - Publication 설정
- `PHASE2_SETUP.md` 생성: Phase 2 설치 가이드 (9KB)

**결과:** ✅ 실시간 동기화 구현 완료, 여러 브라우저에서 동시 작업 시 즉시 반영

---

## 프로젝트 통계

### 파일 구조
```
kanban/
├── index.html (2.9KB)
├── login.html (7.5KB)
├── signup.html (9.0KB)
├── style.css (6.0KB) ← 업데이트
├── script.js (9.5KB) ← 대폭 업데이트
├── auth.js (6.9KB)
├── boardApi.js (8.5KB) ← 신규
├── realtime.js (4.5KB) ← 신규
├── config.js (gitignored)
├── config.example.js (0.2KB)
├── .gitignore
├── CLAUDE.md (9.0KB) ← 업데이트
├── SUPABASE.md (8.0KB)
├── WORKFLOW.md (이 문서)
├── migration.sql (6.2KB) ← 신규
├── realtime_setup.sql (2.5KB) ← 신규
├── PHASE1_SETUP.md (9.5KB) ← 신규
├── PHASE2_SETUP.md (9.0KB) ← 신규
└── docs/
    ├── PLAN.md (5.0KB)
    ├── PRD.md (9.9KB)
    ├── TRD.md (18KB)
    ├── USER_FLOW.md (27KB)
    ├── DATABASE_DESIGN.md (24KB)
    ├── DESIGN_SYSTEM.md (17KB)
    └── TASKS.md (9.2KB)
```

### 개발 지표
- **총 파일 수**: 25개 (코드 10개, 문서 13개, SQL 2개)
- **총 코드 라인**: ~3,500줄 (+1,000줄)
- **총 문서 크기**: ~160KB (+30KB)
- **Git 커밋**: 20+ commits
- **개발 시간**: 1일 (2026-06-18)
- **주요 기능**: 칸반보드 + Supabase 인증 + **Supabase DB + Realtime**

### 기술 스택
- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Authentication**: Supabase Auth (Email + GitHub OAuth)
- **Database**: Supabase PostgreSQL (RLS 보안) ← 추가
- **Realtime**: Supabase Realtime (WebSocket) ← 추가
- **Storage**: localStorage → Supabase DB 마이그레이션 완료

---

## 다음 단계 (Roadmap)

### v1.3 (Phase 3 - 진행 예정)
- 보드 공유 기능
- 멤버 초대 (이메일/링크)
- 역할 관리 (owner, editor, viewer)
- 활동 로그 기록

### v1.4 (Phase 4 - 계획)
- 활동 로그 UI
- 사용자별 활동 피드
- 알림 시스템

### v2.0 (Enhancement)
- 카드 편집 기능
- 우선순위 표시
- 검색 및 필터
- 라벨/태그 시스템
- 댓글 기능

---

## 버전 히스토리

- **v1.0** (2026-06-18 오전): 기본 칸반보드 + 여름 테마 + localStorage
- **v1.1** (2026-06-18 오후): Supabase 이메일/GitHub OAuth 인증 추가
- **v1.2** (2026-06-18 저녁): Phase 1 완료 - Supabase Database 마이그레이션
- **v1.2.1** (2026-06-18 저녁): Phase 2 완료 - Supabase Realtime 실시간 동기화

---

## Phase 별 주요 성과

### Phase 1: 데이터베이스 기초 ✅
- localStorage → Supabase PostgreSQL 전환
- 자동 마이그레이션 기능
- RLS 보안 정책
- 클라우드 기반 데이터 저장

### Phase 2: 실시간 동기화 ✅
- Supabase Realtime WebSocket 연결
- 여러 브라우저 동시 작업 지원
- 실시간 알림 (토스트)
- 자동 화면 갱신

### Phase 3: 보드 공유 (다음 단계)
- 멤버 초대 시스템
- 역할 기반 접근 제어
- 공유 보드 관리

### Phase 4: 활동 로그 (계획)
- 사용자 활동 기록
- 활동 피드 UI
- 알림 시스템

---

### 14. 개인 저장소로 GitHub Pages 배포

**프롬프트:**
```
음private 이긴한데 내가 관리자가 아니라 나중에 바꿔야할 것 같아.
B로 해볼까?
하지만 원래 git 경로에도 commit & push 해
```

**작업 요약:**
- 개인 Public 저장소로 배포 결정 (Private 저장소는 GitHub Pages 무료 사용 불가)
- 칸반보드 파일 전체를 `https://github.com/umdohyun/test01.git`로 복사
- README.md 생성: 프로젝트 소개, 기능, 설치 가이드, 기술 스택
- Git 초기 커밋 및 push 완료
- 원본 저장소 WORKFLOW.md 업데이트

**결과:** ✅ 개인 저장소 배포 완료, 배포 URL: https://umdohyun.github.io/test01/

---

### 15. Photo Album 애플리케이션 구현

**프롬프트:**
```
사진을 개별앨범으로 정리하는 어플리케이션을 구현해줘. 앨범은 날짜별로 그룹화되며, 메인페이지에서 드래그앤드랍으로 재배치가 가능하다. 앨범간 사진 중첩은 허용하지않고, 각 앨범내 사진은 타일형 미리보기 UI로 구현한다.
```

**작업 요약:**
- 새로운 폴더 생성: `day03/photo-album/`
- `index.html` (13KB): 메인 앨범 페이지
  - 업로드 섹션 (파일 선택 버튼)
  - 앨범 그리드 (날짜별 카드)
  - 앨범 상세 모달 (사진 타일 그리드)
  - 사진 뷰어 모달 (전체 화면, prev/next 네비게이션)
  - 로딩 오버레이 (업로드 진행 표시)
- `style.css` (12KB): 전체 스타일링
  - 보라색 그라데이션 배경 (칸반보드와 동일 테마)
  - Grid 레이아웃 (auto-fill, minmax(320px, 1fr))
  - 앨범 카드 드래그 상태 스타일 (.dragging)
  - 타일 미리보기 (2x2 그리드, 최대 4장 표시)
  - 모달 애니메이션 (fadeIn, slideUp)
  - 반응형 디자인 (768px 브레이크포인트)
- `script.js` (11KB): 앨범 로직 및 드래그앤드롭
  - `organizeAlbums()`: 날짜별 자동 그룹화 (YYYY-MM-DD)
  - `renderAlbums()`: 앨범 카드 생성, 저장된 순서 적용
  - 드래그 핸들러: dragstart, dragover, drop, dragend
  - `openAlbum()`: 앨범 상세 모달 열기
  - `openPhotoViewer()`: 사진 전체 화면 뷰어 열기
  - `handleFileUpload()`: 다중 파일 업로드 처리
  - `handleDeletePhoto()`: 사진 삭제 (Storage + DB)
- `storage.js` (6.5KB): Supabase Storage API 레이어
  - `uploadPhoto()`: 파일 업로드 (10MB 제한, 유효성 검사)
  - `fetchPhotos()`: 사용자 사진 목록 조회
  - `deletePhoto()`: Storage + DB 동시 삭제
  - `updateAlbumOrder()`: 드래그앤드롭 순서 저장 (JSONB)
  - `getAlbumOrder()`: 저장된 순서 불러오기
  - Storage 경로: `photos/{userId}/{timestamp}_{random}.{ext}`
- `migration.sql` (5KB): 데이터베이스 스키마
  - `photos` 테이블: 파일 메타데이터 (path, url, size, mime_type)
  - `user_settings` 테이블: album_order (JSONB) 저장
  - RLS 정책: 사용자별 격리
  - Storage RLS 정책: 폴더별 접근 제어
  - Storage Bucket 생성 가이드 (수동 작업 필요)
- `auth.js` (6.9KB): 칸반보드에서 복사 (인증 공유)
- `config.js` (0.2KB): 칸반보드에서 복사 (Supabase 자격증명 공유)
- `README.md` (6.6KB): Photo Album 문서
  - 주요 기능 설명 (날짜별 그룹화, 드래그앤드롭, 타일 미리보기)
  - 설치 가이드 (Supabase 설정, Storage 버킷 생성)
  - UI 구조 다이어그램
  - 보안 및 데이터 구조 설명
  - 트러블슈팅 가이드

**주요 특징:**
- ✅ 날짜별 자동 그룹화 (업로드 날짜 기준)
- ✅ 드래그앤드롭 재배치 (순서는 user_settings에 저장)
- ✅ 타일형 미리보기 (앨범당 최대 4장 표시)
- ✅ 사진 중복 방지 (한 사진 = 한 앨범)
- ✅ Supabase Storage 실제 파일 업로드
- ✅ 전체 화면 사진 뷰어 (prev/next 네비게이션)
- ✅ 사진 삭제 기능 (Storage + DB 동시 삭제)
- ✅ 개인 저장소 (RLS로 사용자별 격리)

**데이터베이스 구조:**
```sql
photos (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  file_path TEXT,
  url TEXT,
  file_size INTEGER,
  mime_type VARCHAR(100),
  original_name TEXT,
  created_at TIMESTAMP
)

user_settings (
  id UUID PRIMARY KEY,
  user_id UUID UNIQUE REFERENCES auth.users,
  album_order JSONB DEFAULT '[]',
  created_at TIMESTAMP
)
```

**결과:** ✅ Photo Album 애플리케이션 완성 및 커밋 (8 파일, 2,063줄)

---

### 16. WORKFLOW.md 자동 갱신 규칙 추가

**프롬프트:**
```
아 그리고 CLAUDE.md에 지금까지 했던 내 프롬포트 내용과 일련의 작업내용을 WORKFLOW.md 에 작성해줘. 앞으로 다른 작업을 해도 말이야
```

**작업 요약:**
- WORKFLOW.md에 Photo Album 작업 내용 추가
- CLAUDE.md에 "Workflow Documentation" 섹션 추가
- 모든 작업 후 WORKFLOW.md 자동 업데이트 규칙 명시
- 프롬프트 원문 보존 원칙 추가
- 작업 요약 포맷 표준화

**WORKFLOW.md 업데이트 규칙:**
- ✅ 모든 사용자 요청 후 WORKFLOW.md 갱신
- ✅ 프롬프트는 원문 그대로 보존
- ✅ 작업 요약은 bullet point로 간결하게
- ✅ 생성/수정된 파일 명시
- ✅ 결과 상태 명확히 표시
- ✅ Git 커밋 전 필수 체크

**결과:** ✅ 개발 과정 자동 문서화 시스템 구축

---

---

### 17. Photo Album 인증 및 경로 수정

**프롬프트:**
```
http://localhost:8000/ 이걸로 들어가서 확인하려는데 뭔가 칸반보드가 열려. 이전 서버에 연결되어있는건가?
너가 말한 사이트로 들어가려니까 자꾸 칸반보드 로그인쪽으로 가져
확인했어. 이제 데모모드 풀고 업로드 기능도 활성화하자.
```

**작업 요약:**
- 서버 전환: kanban → photo-album 폴더에서 실행
- `script.js` 수정: `../kanban/login.html` → `login.html` (상대 경로)
- `login.html`, `signup.html` 복사: kanban → photo-album
- 데모 모드 구현 (임시): 인증 우회하여 UI 확인 가능하게
- 데모 모드 제거: 정상 인증 플로우로 복원
- `index-backup.html` 생성: 원본 백업

**결과:** ✅ Photo Album 인증 시스템 정상 작동, 로그인 후 사진 업로드 가능

---

**문서 작성일**: 2026-06-18  
**최종 수정일**: 2026-06-18 (Phase 1 & 2 완료 + GitHub Pages 배포 + Photo Album 구현 및 인증 수정)
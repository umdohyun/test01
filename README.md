# 🎯 칸반보드 - Supabase 기반 실시간 협업 보드

여름 테마의 드래그 앤 드롭 칸반보드입니다. Supabase를 활용한 인증, 데이터베이스, 실시간 동기화 기능을 제공합니다.

## 🌐 배포 URL

**GitHub Pages**: https://umdohyun.github.io/test01/

## ✨ 주요 기능

### 🔐 인증
- 이메일/비밀번호 회원가입 및 로그인
- GitHub OAuth 소셜 로그인
- Supabase Auth 기반 보안 인증

### 📊 칸반보드
- 3개 컬럼: 할 일, 진행중, 완료
- 드래그 앤 드롭으로 카드 이동
- 카드 추가/삭제
- 여름 테마 (청록색/민트 그라데이션)

### 💾 데이터베이스
- Supabase PostgreSQL
- Row Level Security (RLS) 보안
- localStorage → Supabase 자동 마이그레이션
- 클라우드 기반 데이터 저장

### 🚀 실시간 동기화
- Supabase Realtime WebSocket
- 여러 브라우저에서 동시 작업 지원
- 실시간 알림 (토스트)
- 자동 화면 갱신

## 🛠️ 기술 스택

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL
- **Realtime**: Supabase Realtime (WebSocket)
- **Hosting**: GitHub Pages

## 📦 설치 및 실행

### 1. Supabase 설정

자세한 내용은 [SUPABASE.md](SUPABASE.md) 참고

```bash
# config.js 생성
cp config.example.js config.js

# Supabase 자격증명 입력
# - Project URL
# - anon key
```

### 2. 데이터베이스 마이그레이션

Supabase Dashboard > SQL Editor에서 실행:

```bash
# 1. 테이블 생성
cat migration.sql

# 2. Realtime 활성화
cat realtime_setup.sql
```

### 3. 로컬 실행

```bash
# HTTP 서버 실행
python3 -m http.server 8000

# 브라우저 접속
# http://localhost:8000
```

## 📚 문서

- **[PHASE1_SETUP.md](PHASE1_SETUP.md)** - 데이터베이스 기초 가이드
- **[PHASE2_SETUP.md](PHASE2_SETUP.md)** - 실시간 동기화 가이드
- **[GITHUB_PAGES.md](GITHUB_PAGES.md)** - 배포 가이드
- **[SUPABASE.md](SUPABASE.md)** - Supabase 설정 가이드
- **[CLAUDE.md](CLAUDE.md)** - 개발 가이드
- **[WORKFLOW.md](WORKFLOW.md)** - 개발 과정 기록

## 🎨 디자인

### 색상 팔레트
- Primary: `#00bcd4` (시안 블루)
- Secondary: `#26c6da` (밝은 시안)
- Background: `linear-gradient(135deg, #06beb6 0%, #48b1bf 50%, #87ceeb 100%)`

### 반응형 디자인
- Desktop: >992px (3 columns horizontal)
- Tablet: 768-992px (3 columns vertical)
- Mobile: <768px (full width vertical)

## 🔐 보안

### Row Level Security (RLS)
- 각 사용자는 본인의 데이터만 접근 가능
- SQL 정책으로 강제 적용
- anon key는 공개해도 안전 (RLS 보호)

### Supabase anon key
- ✅ 클라이언트에 노출 가능
- ✅ RLS 정책으로 보호됨
- ❌ service_role key는 절대 노출 금지

## 📊 프로젝트 구조

```
test01/
├── index.html              # 메인 칸반보드
├── login.html              # 로그인 페이지
├── signup.html             # 회원가입 페이지
├── style.css               # 전체 스타일
├── script.js               # 칸반보드 로직
├── auth.js                 # 인증 모듈
├── boardApi.js             # Supabase CRUD API
├── realtime.js             # Realtime 구독
├── config.js               # Supabase 자격증명
├── migration.sql           # 데이터베이스 스키마
├── realtime_setup.sql      # Realtime 활성화
└── docs/                   # 설계 문서
    ├── PLAN.md
    ├── PRD.md
    ├── TRD.md
    ├── USER_FLOW.md
    ├── DATABASE_DESIGN.md
    ├── DESIGN_SYSTEM.md
    └── TASKS.md
```

## 📈 개발 통계

- **총 파일 수**: 25개 (코드 10개, 문서 13개, SQL 2개)
- **총 코드 라인**: ~3,500줄
- **총 문서 크기**: ~160KB
- **개발 기간**: 1일 (2026-06-18)

## 🚀 버전 히스토리

- **v1.0** - 기본 칸반보드 + 여름 테마 + localStorage
- **v1.1** - Supabase 이메일/GitHub OAuth 인증 추가
- **v1.2** - Phase 1: Supabase Database 마이그레이션
- **v1.2.1** - Phase 2: Supabase Realtime 실시간 동기화

## 📝 라이선스

MIT License

## 👤 Author

**Dohyun Um**
- GitHub: [@umdohyun](https://github.com/umdohyun)

## 🙏 Acknowledgments

- [Supabase](https://supabase.com) - Backend as a Service
- [GitHub Pages](https://pages.github.com) - Free hosting
- Claude Sonnet 4.5 - Development assistance

---

**배포 URL**: https://umdohyun.github.io/test01/  
**원본 저장소**: https://github.com/weable-kosa/kosa-vibecoding-2026-3rd/tree/main/src/exercise/umdohy/day03/kanban

# 오늘 할 일 - Todo List 애플리케이션 ✨🌸

Material Design 기반의 우선순위 관리 기능을 가진 Todo List 웹 애플리케이션입니다.

## ✨ 주요 기능

### 🎯 Todo 관리
- ✅ 할 일 추가/완료/삭제
- 🎨 우선순위 설정 (높음/중간/낮음)
- 📊 우선순위별 자동 정렬
- 💾 Supabase 클라우드 저장

### 🔐 사용자 인증
- 📧 이메일/비밀번호 회원가입
- ✉️ 이메일 인증
- 🔑 로그인/로그아웃
- 👤 사용자별 데이터 격리

### 📱 반응형 디자인
- 💻 데스크톱 (769px~)
- 📱 태블릿 (481-768px)
- 📱 모바일 (~480px)

## 🚀 시작하기

### 1. Supabase 설정

#### 데이터베이스 초기화
Supabase Dashboard → SQL Editor에서 실행:

```bash
# 1. 초기 테이블 생성
setup.sql 실행

# 2. 인증 기능 추가 마이그레이션
migration_auth.sql 실행
```

#### API 키 설정
`config.js` 파일 생성 (이미 생성됨):
```javascript
const SUPABASE_URL = 'your-project-url'
const SUPABASE_ANON_KEY = 'your-anon-key'
```

### 2. 로컬 개발 서버 실행

```bash
# Python 3 기본 내장 서버
python3 -m http.server 8000

# 브라우저에서 접속
http://localhost:8000/signup.html  # 회원가입
http://localhost:8000/login.html   # 로그인
http://localhost:8000/index.html   # Todo 앱
```

## 📂 파일 구조

```
todo/
├── index.html          # Todo 앱 메인 페이지 (인증 필요)
├── login.html          # 로그인 페이지
├── signup.html         # 회원가입 페이지
├── script.js           # Todo 로직 (CRUD + user_id)
├── auth.js             # 인증 관련 함수
├── style.css           # Todo 앱 스타일
├── auth-style.css      # 인증 페이지 스타일
├── config.js           # Supabase API 설정 (gitignore)
├── config.example.js   # 설정 예시
├── setup.sql           # 초기 DB 스키마
├── migration_auth.sql  # 인증 기능 마이그레이션
├── AUTH.md             # 인증 기능 가이드
├── SUPABASE.md         # Supabase 연동 가이드
├── GITHUB_PAGES.md     # GitHub Pages 배포 가이드
├── CLAUDE.md           # 프로젝트 개요
└── README.md           # 이 파일
```

## 🗄️ 데이터베이스 스키마

### `todos` 테이블
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary Key |
| text | text | 할 일 내용 |
| completed | boolean | 완료 여부 |
| priority | text | 우선순위 (high/medium/low) |
| user_id | uuid | 사용자 ID (FK: auth.users) |
| created_at | timestamptz | 생성 시간 |
| updated_at | timestamptz | 수정 시간 |

### RLS (Row Level Security)
- 사용자는 자신의 할 일만 조회/추가/수정/삭제 가능
- 다른 사용자의 데이터는 접근 불가

## 🎨 사용 흐름

### 1. 회원가입
```
signup.html → 이메일/비밀번호 입력
           → 인증 이메일 수신
           → 이메일 링크 클릭
           → 계정 활성화
```

### 2. 로그인
```
login.html → 이메일/비밀번호 입력
          → index.html (Todo 앱)
```

### 3. Todo 관리
```
index.html → 할 일 입력 + 우선순위 선택
          → 추가 버튼 클릭
          → 목록에 표시 (우선순위별 정렬)
          → 체크박스로 완료 표시
          → 삭제 버튼으로 제거
```

### 4. 로그아웃
```
index.html 우측 상단 → 로그아웃 버튼
                    → login.html
```

## 🔧 주요 기능 구현

### 인증 체크
```javascript
// 페이지 로드 시 자동 실행
checkAuth() → 세션 없으면 login.html로 리다이렉트
           → 세션 있으면 사용자 정보 표시 + Todo 로드
```

### Todo CRUD
```javascript
// 모든 쿼리에 user_id 필터 적용
loadTodos()   → .eq('user_id', currentUser.id)
addTodo()     → { ..., user_id: currentUser.id }
toggleTodo()  → .eq('id', id).eq('user_id', currentUser.id)
deleteTodo()  → .eq('id', id).eq('user_id', currentUser.id)
```

## 🧪 테스트 시나리오

### 회원가입 & 인증
- [ ] 이메일 형식 검증
- [ ] 비밀번호 6자 이상 검증
- [ ] 비밀번호 확인 일치 검증
- [ ] 인증 이메일 수신
- [ ] 이메일 링크 클릭 시 계정 활성화

### 로그인
- [ ] 잘못된 이메일/비밀번호 에러
- [ ] 이메일 미인증 에러
- [ ] 로그인 성공 후 Todo 앱 접근

### 데이터 격리
- [ ] 사용자 A의 할 일이 사용자 B에게 안 보임
- [ ] 로그아웃 후 다른 계정으로 로그인 시 다른 데이터

### Todo 기능
- [ ] 할 일 추가 (DB 저장 확인)
- [ ] 우선순위별 정렬
- [ ] 완료 체크/해제
- [ ] 삭제
- [ ] 새로고침 시 데이터 유지

### 반응형
- [ ] 데스크톱 레이아웃
- [ ] 태블릿 레이아웃
- [ ] 모바일 레이아웃

## 🚨 문제 해결

### 로그인 실패
- Supabase Dashboard → Authentication → Users에서 이메일 인증 상태 확인
- 이메일 인증이 안됐으면 재전송 또는 수동 활성화

### Todo가 안 보임
- 브라우저 콘솔(F12) 확인
- RLS 정책이 올바르게 설정되었는지 확인
- `migration_auth.sql`이 실행되었는지 확인

### CORS 에러
- Supabase Dashboard → Settings → API
- Allowed Origins에 `http://localhost:8000` 추가

## 📚 참고 문서

- [AUTH.md](./AUTH.md) - 인증 기능 상세 가이드
- [SUPABASE.md](./SUPABASE.md) - Supabase 연동 가이드
- [GITHUB_PAGES.md](./GITHUB_PAGES.md) - 배포 가이드
- [CLAUDE.md](./CLAUDE.md) - 프로젝트 개요

## 🎯 향후 개선 사항

- [ ] 소셜 로그인 (Google, GitHub)
- [ ] 비밀번호 재설정
- [ ] 프로필 편집
- [ ] 할 일 카테고리/태그
- [ ] 마감일 설정
- [ ] 알림 기능
- [ ] 다크 모드
- [ ] 할 일 검색
- [ ] 필터링 (완료/미완료/우선순위)
- [ ] 할 일 공유 기능

## 📄 라이선스

MIT License

## 👤 개발자

- Dohyun Um
- Co-Authored-By: Claude Sonnet 4.5

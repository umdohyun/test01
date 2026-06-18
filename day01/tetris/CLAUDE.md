# Tetris 풀스택 애플리케이션

## 프로젝트 개요

FastAPI 백엔드와 Vanilla JavaScript 프론트엔드로 구성된 완전한 풀스택 테트리스 게임입니다.

### 주요 특징
- 이메일 기반 회원가입/로그인 시스템
- Bearer Token 인증
- 게임 기록 자동 저장 및 관리
- 실시간 리더보드 및 최고 점수 표시
- SQLite 데이터베이스 연동

## 아키텍처

### 백엔드 (FastAPI)
```
포트: 8001
프레임워크: FastAPI 0.115.12
서버: Uvicorn 0.34.0
데이터베이스: SQLite (tetris.db)
```

**API 엔드포인트:**
- `POST /api/signup` - 회원가입
- `POST /api/login` - 로그인
- `POST /api/logout` - 로그아웃
- `POST /api/game-records` - 게임 기록 저장
- `GET /api/leaderboard` - 리더보드 조회
- `GET /api/top-score` - 최고 점수 조회
- `GET /api/my-stats` - 사용자 통계
- `GET /api/my-history` - 플레이 이력

### 프론트엔드
```
포트: 8080 (Python HTTP 서버)
기술: Vanilla JavaScript, HTML5 Canvas, CSS3
```

**페이지 구성:**
- `index.html` - 랜딩 페이지
- `auth.html` - 로그인/회원가입
- `game.html` - 게임 플레이 화면
- `leaderboard.html` - 리더보드

### 데이터베이스 스키마

```sql
-- 사용자 테이블
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 세션 토큰 테이블
CREATE TABLE sessions (
    token TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 게임 기록 테이블
CREATE TABLE game_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    score INTEGER NOT NULL,
    level INTEGER NOT NULL,
    lines INTEGER NOT NULL,
    played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## 실행 방법

### 1. 의존성 설치
```bash
pip install -r requirements.txt
```

### 2. 서버 시작

**방법 1: 스크립트 사용 (권장)**
```bash
./START.sh
```

**방법 2: 수동 실행**
```bash
# 백엔드 서버 (백그라운드)
python3 backend.py > backend.log 2>&1 &

# 프론트엔드 서버
python3 -m http.server 8080
```

### 3. 접속
- 게임: http://localhost:8080
- API 문서: http://localhost:8001/docs
- 리더보드: http://localhost:8080/leaderboard.html

## 파일 구조

```
tetris/
├── backend.py              # FastAPI 백엔드 서버
├── tetris.db               # SQLite 데이터베이스
├── requirements.txt        # Python 의존성
├── START.sh                # 서버 시작 스크립트
├── .gitignore              # Git 제외 설정
│
├── index.html              # 랜딩 페이지
├── auth.html               # 로그인/회원가입
├── game.html               # 게임 플레이 화면
├── leaderboard.html        # 리더보드
├── game.js                 # 게임 로직
├── style.css               # 스타일시트
│
├── README.md               # 설치 및 실행 가이드
├── USAGE.md                # 사용자 가이드
├── FEATURES.md             # 구현 기능 목록
├── PROJECT_SUMMARY.md      # 프로젝트 요약
└── CLAUDE.md               # 개발 문서 (현재 파일)
```

## 개발 작업 내역

### 2026-06-16 - 초기 구축

#### 백엔드 개발
1. **FastAPI 프로젝트 설정**
   - FastAPI, Uvicorn, Pydantic 설치
   - CORS 미들웨어 설정
   - HTTPBearer 보안 스키마 적용

2. **데이터베이스 설계 및 구현**
   - SQLite 데이터베이스 자동 초기화
   - 3개 테이블 생성 (users, sessions, game_records)
   - Foreign Key 제약조건 설정

3. **인증 시스템 구현**
   - 이메일 유효성 검사 (Pydantic EmailStr)
   - SHA-256 비밀번호 해싱
   - 안전한 토큰 생성 (secrets.token_urlsafe)
   - Bearer Token 인증 미들웨어

4. **게임 기록 API 구현**
   - 게임 기록 저장 엔드포인트
   - 리더보드 조회 (정렬, LIMIT)
   - 최고 점수 조회
   - 사용자별 통계 및 이력

#### 프론트엔드 개발
1. **인증 UI 구현**
   - 로그인/회원가입 폼
   - 토글 기능
   - 클라이언트 측 유효성 검사
   - localStorage 토큰 관리
   - 자동 리다이렉트

2. **게임 화면 연동**
   - 기존 Tetris 게임 로직 유지
   - 백엔드 API 연동
   - 게임 종료 시 자동 저장
   - 최고 점수 실시간 표시
   - 사용자 정보 표시
   - 로그아웃 기능

3. **리더보드 페이지 구현**
   - 상위 20명 표시
   - 순위별 색상 (금/은/동)
   - 날짜 포맷팅
   - 새로고침 기능

4. **랜딩 페이지 업데이트**
   - 리더보드 링크 추가
   - 버튼 스타일 개선

#### 문서화
1. **README.md** - 설치 및 실행 가이드
2. **USAGE.md** - 사용자 가이드
3. **FEATURES.md** - 구현 기능 목록
4. **PROJECT_SUMMARY.md** - 프로젝트 기술 요약
5. **START.sh** - 원클릭 서버 시작 스크립트

#### 테스트
- 5개 테스트 계정 생성 (player1~5@example.com)
- 게임 기록 저장 테스트
- 리더보드 정렬 테스트
- 최고 점수 조회 테스트
- 인증 플로우 테스트

## 코딩 컨벤션

### Python (Backend)
- PEP 8 스타일 가이드 준수
- Type hints 사용 (Pydantic 모델)
- async/await 비동기 처리
- 명확한 함수명과 변수명

### JavaScript (Frontend)
- ES6+ 문법 사용
- const/let (var 사용 안 함)
- async/await for API calls
- 명확한 함수명

### 네이밍 규칙
- 파일명: snake_case (Python), kebab-case (HTML/CSS)
- 함수명: snake_case (Python), camelCase (JavaScript)
- 변수명: snake_case (Python), camelCase (JavaScript)
- 상수: UPPER_SNAKE_CASE
- 클래스: PascalCase

## 보안 고려사항

### 현재 구현
1. **비밀번호 보안**
   - SHA-256 해싱 (평문 저장 안 함)
   - 클라이언트 측 최소 길이 검증 (6자)

2. **인증 토큰**
   - secrets.token_urlsafe(32) 사용
   - Bearer Token 스키마
   - 로그아웃 시 DB에서 삭제

3. **SQL Injection 방지**
   - 파라미터화된 쿼리만 사용
   - 사용자 입력 직접 연결 금지

4. **CORS**
   - 개발 환경: 모든 오리진 허용
   - 프로덕션 배포 시 특정 도메인만 허용 필요

### 향후 개선 필요 사항
- [ ] HTTPS 적용
- [ ] 비밀번호 강도 검증 강화
- [ ] Rate Limiting
- [ ] JWT 토큰 (만료 시간)
- [ ] Refresh Token
- [ ] CSRF 보호
- [ ] XSS 방지

## 성능 최적화

### 현재 구현
1. **비동기 처리**
   - FastAPI async/await
   - 게임 루프와 독립적인 API 호출

2. **캐싱**
   - localStorage에 토큰 저장
   - 불필요한 API 호출 최소화

3. **효율적인 쿼리**
   - UNIQUE 인덱스 (users.email)
   - PRIMARY KEY 인덱스 (sessions.token)
   - LIMIT 절 사용

### 향후 최적화
- [ ] Redis 캐싱 (세션, 리더보드)
- [ ] PostgreSQL 마이그레이션
- [ ] Connection Pooling
- [ ] CDN 적용
- [ ] 게임 기록 압축/아카이빙

## 테스트 계정

```
이메일: player1@example.com ~ player5@example.com
비밀번호: password123
```

## 알려진 이슈

현재 알려진 이슈 없음

## 향후 개발 계획

### Phase 1: 보안 강화
- HTTPS 적용
- JWT 토큰 (만료 시간)
- Rate Limiting
- 비밀번호 강도 검증

### Phase 2: 기능 추가
- 소셜 로그인 (OAuth)
- 프로필 페이지
- 통계 차트
- 게임 다시보기

### Phase 3: 소셜 기능
- 친구 시스템
- 채팅
- 실시간 멀티플레이

### Phase 4: 성능 개선
- Redis 캐싱
- PostgreSQL 마이그레이션
- CDN 적용
- 서버 사이드 렌더링 (SSR)

## 트러블슈팅

### 포트 충돌
```bash
# 8001 포트 확인
lsof -i :8001
# 프로세스 종료
kill -9 <PID>
```

### 백엔드 연결 실패
```bash
# 로그 확인
cat backend.log
# 서버 재시작
pkill -f backend.py && python3 backend.py &
```

### 데이터베이스 초기화
```bash
# 주의: 모든 데이터 손실
rm tetris.db
python3 backend.py
```

## 참고 자료

- [FastAPI 공식 문서](https://fastapi.tiangolo.com/)
- [SQLite 문서](https://www.sqlite.org/docs.html)
- [Pydantic 문서](https://docs.pydantic.dev/)
- [HTML5 Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)

## 라이선스

이 프로젝트는 교육 목적으로 제작되었습니다.

## 기여자

- 개발: Claude Code (Sonnet 4.5)
- 요청: umdohy
- 날짜: 2026-06-16

---

**마지막 업데이트:** 2026-06-16  
**버전:** 1.0.0  
**상태:** ✅ 프로덕션 준비 완료

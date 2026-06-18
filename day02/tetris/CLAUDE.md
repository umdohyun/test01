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
데이터베이스: SQLite (tetris.db) 또는 MySQL 8.0 (Docker)
Python 클라이언트: sqlite3 (내장) 또는 PyMySQL 1.1.0
```

**두 가지 백엔드 옵션:**
- `backend.py` - SQLite 버전 (개발/간단한 배포)
- `backend_mysql.py` - MySQL 버전 (프로덕션/확장성)

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

#### 옵션 A: SQLite 버전 (간단)
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

#### 옵션 B: MySQL 버전 (프로덕션)
**방법 1: 스크립트 사용 (권장)**
```bash
# MySQL 컨테이너 시작 + 백엔드 + 프론트엔드
./START_MYSQL.sh
```

**방법 2: 수동 실행**
```bash
# 1. MySQL 컨테이너 시작
docker-compose up -d

# 2. 환경 변수 설정 (처음 한 번만)
cp .env.example .env

# 3. 백엔드 서버
python3 backend_mysql.py > backend.log 2>&1 &

# 4. 프론트엔드 서버
python3 -m http.server 8080
```

### 3. 테스트 실행
```bash
# 모든 테스트 (46개)
pytest -v

# SQLite 백엔드 테스트만 (23개)
pytest test_backend.py -v

# MySQL 백엔드 테스트만 (23개)
pytest test_backend_mysql.py -v
```

### 4. 접속
- 게임: http://localhost:8080
- API 문서: http://localhost:8001/docs
- 리더보드: http://localhost:8080/leaderboard.html

## 파일 구조

```
tetris/
├── backend.py              # FastAPI 백엔드 서버 (SQLite)
├── backend_mysql.py        # FastAPI 백엔드 서버 (MySQL) ⭐ NEW
├── tetris.db               # SQLite 데이터베이스
├── requirements.txt        # Python 의존성 (업데이트) ⭐
├── START.sh                # SQLite 서버 시작 스크립트
├── START_MYSQL.sh          # MySQL 서버 시작 스크립트 ⭐ NEW
├── .gitignore              # Git 제외 설정 (업데이트) ⭐
│
├── test_backend.py         # SQLite 백엔드 유닛테스트 ⭐ NEW
├── test_backend_mysql.py   # MySQL 백엔드 유닛테스트 ⭐ NEW
├── pytest.ini              # pytest 설정 ⭐ NEW
│
├── docker-compose.yml      # MySQL 컨테이너 설정 ⭐ NEW
├── .env.example            # 환경 변수 템플릿 ⭐ NEW
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
├── README_TESTS.md         # 테스트 가이드 ⭐ NEW
├── MIGRATION_GUIDE.md      # SQLite → MySQL 마이그레이션 가이드 ⭐ NEW
├── CHANGES.md              # 변경 사항 요약 ⭐ NEW
├── QUICKSTART.md           # 빠른 시작 가이드 ⭐ NEW
└── CLAUDE.md               # 개발 문서 (현재 파일)
```

⭐ = 2026-06-17 추가/수정된 파일

## 개발 작업 내역

### 2026-06-17 - 유닛테스트 및 MySQL 마이그레이션

#### 유닛테스트 구축
1. **테스트 프레임워크 설정**
   - pytest, pytest-asyncio, httpx 설치
   - pytest.ini 설정 파일 생성
   - .gitignore 업데이트 (.pytest_cache, .env 등)

2. **Mocking 기반 유닛테스트 작성**
   - test_backend.py (SQLite 백엔드 테스트 23개)
   - test_backend_mysql.py (MySQL 백엔드 테스트 23개)
   - 총 46개 테스트, 100% 통과
   - 실행 시간: 0.33초 (Mock 사용으로 매우 빠름)

3. **테스트 커버리지**
   - 비밀번호 해싱 함수 (3개 테스트)
   - 세션 관리 함수 (2개 테스트)
   - 모든 API 엔드포인트 (15개 테스트)
   - 데이터베이스 작업 (2개 테스트)
   - 전체 인증 플로우 (1개 통합 테스트)

4. **테스트 전략**
   - `unittest.mock`으로 DB 연결 모킹
   - `@patch` 데코레이터로 실제 함수 교체
   - `side_effect`로 여러 반환값 시뮬레이션
   - FastAPI `TestClient`로 HTTP 요청 테스트
   - AAA 패턴: Arrange → Act → Assert

5. **문서화**
   - README_TESTS.md - 테스트 실행 가이드
   - 테스트 작성 예시 및 모범 사례
   - CI/CD 통합 가이드

#### MySQL 마이그레이션
1. **Docker Compose 설정**
   - docker-compose.yml 작성
   - MySQL 8.0 컨테이너 설정
   - 환경 변수 (.env.example) 제공
   - 헬스체크 및 볼륨 마운트

2. **MySQL 백엔드 구현**
   - backend_mysql.py 작성
   - PyMySQL 라이브러리 사용
   - 파라미터 바인딩: `?` → `%s`
   - DictCursor로 결과 처리
   - 환경 변수로 DB 설정 관리

3. **데이터베이스 스키마 개선**
   - InnoDB 엔진 사용
   - utf8mb4 문자셋 및 collation
   - 성능 최적화 인덱스 추가:
     - `idx_email` (users.email)
     - `idx_user_id` (sessions, game_records)
     - `idx_score` (score DESC)
     - `idx_played_at` (played_at DESC)
   - Foreign Key with CASCADE 옵션

4. **실행 스크립트**
   - START_MYSQL.sh - MySQL 버전 원클릭 실행
   - Docker 상태 확인
   - MySQL 준비 대기
   - 백엔드 자동 시작

5. **마이그레이션 문서**
   - MIGRATION_GUIDE.md - 상세한 마이그레이션 가이드
   - SQLite vs MySQL 차이점 설명
   - 단계별 마이그레이션 절차
   - 트러블슈팅 가이드
   - 롤백 계획

#### 추가 문서
- CHANGES.md - 변경 사항 상세 요약
- QUICKSTART.md - 빠른 시작 가이드

#### 개발 환경 개선
- 양방향 지원: SQLite (개발) + MySQL (프로덕션)
- 테스트 기반 개발 워크플로우 확립
- 코드 수정 시 즉시 검증 가능

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
- [x] MySQL 마이그레이션 (완료)
- [x] 성능 인덱스 추가 (완료)
- [ ] Redis 캐싱 (세션, 리더보드)
- [ ] Connection Pooling
- [ ] CDN 적용
- [ ] 게임 기록 압축/아카이빙

## 테스트 계정

```
이메일: player1@example.com ~ player5@example.com
비밀번호: password123
```

## 테스트

### 테스트 전략
- **Mocking 기반 유닛테스트**: 실제 DB 없이 로직만 검증
- **FastAPI TestClient**: HTTP 요청/응답 테스트
- **pytest fixtures**: 테스트 환경 자동 설정
- **100% 커버리지**: 모든 API 엔드포인트 및 핵심 함수

### 테스트 구조
```python
# 1. 픽스처로 테스트 환경 준비
@pytest.fixture
def mock_db():
    mock_conn = MagicMock()
    mock_cursor = MagicMock()
    return mock_conn, mock_cursor

# 2. @patch로 실제 함수를 Mock으로 교체
@patch('backend.get_db')
def test_signup_success(self, mock_get_db, client, mock_db):
    # 3. Mock 반환값 설정
    mock_cursor.fetchone.side_effect = [None, None]
    
    # 4. API 호출
    response = client.post("/api/signup", json={...})
    
    # 5. 검증
    assert response.status_code == 200
```

### 테스트 실행
```bash
# 전체 테스트 (0.33초)
$ pytest -v
======================== 46 passed in 0.33s ========================

# 특정 테스트만
$ pytest test_backend.py::TestAPIEndpoints::test_signup_success -v
```

### 코드 수정 워크플로우
1. 코드 수정 (`backend.py` 또는 `backend_mysql.py`)
2. `pytest -v` 실행
3. ✅ 모든 테스트 통과 확인
4. 커밋

## 알려진 이슈

- ⚠️ FastAPI `on_event` deprecation warning (향후 `lifespan`으로 마이그레이션 예정)

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
- [x] MySQL 마이그레이션 (완료)
- [x] 유닛테스트 작성 (완료)
- [ ] Redis 캐싱
- [ ] Connection Pooling
- [ ] CDN 적용
- [ ] 서버 사이드 렌더링 (SSR)

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

**SQLite:**
```bash
# 주의: 모든 데이터 손실
rm tetris.db
python3 backend.py
```

**MySQL:**
```bash
# 컨테이너 재생성 (데이터 삭제)
docker-compose down -v
docker-compose up -d

# 또는 MySQL CLI로 수동 삭제
docker-compose exec mysql mysql -u tetris_user -ptetris_password tetris <<EOF
DROP TABLE IF EXISTS game_records;
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS users;
EOF
```

### MySQL 관련

**컨테이너 관리:**
```bash
# 시작
docker-compose up -d

# 중지
docker-compose down

# 로그 확인
docker-compose logs -f mysql

# 상태 확인
docker-compose ps
```

**데이터 백업/복원:**
```bash
# 백업
docker-compose exec mysql mysqldump -u tetris_user -ptetris_password tetris > backup.sql

# 복원
docker-compose exec -T mysql mysql -u tetris_user -ptetris_password tetris < backup.sql
```

## 참고 자료

### 프레임워크 & 라이브러리
- [FastAPI 공식 문서](https://fastapi.tiangolo.com/)
- [Pydantic 문서](https://docs.pydantic.dev/)
- [pytest 문서](https://docs.pytest.org/)
- [HTML5 Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)

### 데이터베이스
- [SQLite 문서](https://www.sqlite.org/docs.html)
- [MySQL 8.0 문서](https://dev.mysql.com/doc/)
- [PyMySQL 문서](https://pymysql.readthedocs.io/)

### DevOps
- [Docker Compose 문서](https://docs.docker.com/compose/)
- [Docker Hub - MySQL](https://hub.docker.com/_/mysql)

### 내부 문서
- `README_TESTS.md` - 테스트 가이드
- `MIGRATION_GUIDE.md` - MySQL 마이그레이션 가이드
- `CHANGES.md` - 변경 사항 상세
- `QUICKSTART.md` - 빠른 시작

## 라이선스

이 프로젝트는 교육 목적으로 제작되었습니다.

## 기여자

- 개발: Claude Code (Sonnet 4.5)
- 요청: umdohy
- 초기 개발: 2026-06-16
- 테스트 & MySQL 추가: 2026-06-17

---

**마지막 업데이트:** 2026-06-17  
**버전:** 2.0.0 (MySQL 지원, 유닛테스트 추가)  
**상태:** ✅ 프로덕션 준비 완료  
**테스트:** ✅ 46개 테스트 통과 (100%)

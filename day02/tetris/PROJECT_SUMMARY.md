# Tetris 풀스택 애플리케이션 - 프로젝트 요약

## 프로젝트 개요

FastAPI 백엔드와 Vanilla JavaScript 프론트엔드로 구성된 풀스택 테트리스 게임입니다.

## 핵심 기능

### 1. 인증 시스템
- ✅ 이메일 기반 회원가입/로그인
- ✅ Bearer Token 인증
- ✅ 비밀번호 해싱 (SHA-256)

### 2. 게임 기록 관리
- ✅ 게임 종료 시 자동 저장
- ✅ 점수, 레벨, 라인 수 기록
- ✅ 플레이 시간 저장

### 3. 리더보드
- ✅ 전체 사용자 최고 점수 표시
- ✅ 상위 20명 랭킹
- ✅ 실시간 업데이트

### 4. 게임 기능
- ✅ 7종 테트로미노
- ✅ 고스트 블록
- ✅ 레벨 시스템 (시간/라인 기반)
- ✅ 점수 계산 (1~4줄, 레벨별 배율)

## 기술 스택

### 백엔드
- **프레임워크**: FastAPI 0.115.12
- **서버**: Uvicorn 0.34.0
- **데이터베이스**: SQLite
- **인증**: Bearer Token + HTTPBearer
- **유효성 검사**: Pydantic (EmailStr)

### 프론트엔드
- **언어**: Vanilla JavaScript (ES6+)
- **그래픽**: HTML5 Canvas API
- **스타일**: CSS3 (Gradient, Animation)
- **상태 관리**: localStorage

### 데이터베이스 스키마

```sql
-- 사용자 테이블
users (
  id INTEGER PRIMARY KEY,
  email TEXT UNIQUE,
  password_hash TEXT,
  created_at TIMESTAMP
)

-- 세션 테이블
sessions (
  token TEXT PRIMARY KEY,
  user_id INTEGER,
  created_at TIMESTAMP
)

-- 게임 기록 테이블
game_records (
  id INTEGER PRIMARY KEY,
  user_id INTEGER,
  score INTEGER,
  level INTEGER,
  lines INTEGER,
  played_at TIMESTAMP
)
```

## API 엔드포인트

### 인증
- `POST /api/signup` - 회원가입
- `POST /api/login` - 로그인
- `POST /api/logout` - 로그아웃 (인증 필요)

### 게임 기록
- `POST /api/game-records` - 게임 기록 저장 (인증 필요)
- `GET /api/leaderboard?limit=20` - 리더보드 조회
- `GET /api/top-score` - 최고 점수 조회
- `GET /api/my-stats` - 내 통계 조회 (인증 필요)
- `GET /api/my-history?limit=20` - 내 플레이 이력 (인증 필요)

## 파일 구조

```
tetris/
├── backend.py              # FastAPI 백엔드 서버
├── tetris.db              # SQLite 데이터베이스
├── requirements.txt        # Python 의존성
├── START.sh               # 서버 시작 스크립트
├── .gitignore             # Git 제외 파일
│
├── index.html             # 랜딩 페이지
├── auth.html              # 로그인/회원가입
├── game.html              # 게임 플레이 화면
├── leaderboard.html       # 리더보드
├── game.js                # 게임 로직
├── style.css              # 스타일시트
│
├── README.md              # 설치 및 실행 가이드
├── USAGE.md               # 사용자 가이드
├── FEATURES.md            # 구현 기능 목록
└── PROJECT_SUMMARY.md     # 프로젝트 요약 (현재 파일)
```

## 실행 방법

### 1. 의존성 설치
```bash
pip install -r requirements.txt
```

### 2. 서버 실행
```bash
# 방법 1: 스크립트 사용 (권장)
./START.sh

# 방법 2: 수동 실행
python3 backend.py &
python3 -m http.server 8080
```

### 3. 브라우저 접속
- http://localhost:8080

## 보안 고려사항

1. **비밀번호 보안**
   - SHA-256 해싱
   - 평문 저장 안 함

2. **인증 토큰**
   - 안전한 랜덤 생성 (secrets.token_urlsafe)
   - Bearer Token 스키마
   - 로그아웃 시 무효화

3. **SQL Injection 방지**
   - 파라미터화된 쿼리 사용
   - ORM 스타일 쿼리

4. **CORS**
   - 개발 환경: 모든 오리진 허용
   - 프로덕션: 특정 도메인만 허용 권장

## 성능 최적화

1. **비동기 처리**
   - FastAPI의 async/await
   - 게임 루프와 독립적인 API 호출

2. **캐싱**
   - localStorage에 토큰 저장
   - 불필요한 API 호출 최소화

3. **효율적인 쿼리**
   - 인덱스 활용 (users.email, sessions.token)
   - LIMIT 절로 결과 제한

## 향후 개선 가능 항목

1. **보안 강화**
   - HTTPS 적용
   - 비밀번호 강도 검증
   - Rate Limiting
   - JWT 토큰 (만료 시간)

2. **기능 추가**
   - 소셜 로그인 (OAuth)
   - 친구 시스템
   - 게임 다시보기
   - 실시간 멀티플레이

3. **UI/UX 개선**
   - 프로필 페이지
   - 통계 차트
   - 애니메이션 효과
   - 다크/라이트 테마

4. **성능 개선**
   - Redis 캐싱
   - PostgreSQL 마이그레이션
   - CDN 적용
   - 게임 기록 압축

## 테스트

현재 5명의 테스트 사용자와 게임 기록이 생성되어 있습니다:
- player1@example.com ~ player5@example.com
- 비밀번호: password123

## 라이선스

이 프로젝트는 교육 목적으로 제작되었습니다.

## 개발자

- 개발: Claude Code
- 일자: 2026-06-16

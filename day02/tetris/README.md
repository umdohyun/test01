# Tetris 풀스택 애플리케이션

FastAPI 백엔드와 Vanilla JavaScript 프론트엔드로 구성된 테트리스 게임입니다.

## 기능

- 이메일 회원가입 및 로그인
- 게임 플레이 기록 저장
- 전체 사용자 최고 점수 표시
- 리더보드 (상위 20명)
- 사용자별 통계 및 플레이 이력

## 설치 및 실행

### 1. 의존성 설치

```bash
pip install -r requirements.txt
```

### 2. 백엔드 서버 실행

```bash
python3 backend.py
```

서버는 `http://localhost:8001`에서 실행됩니다.

### 3. 프론트엔드 실행

프론트엔드 HTML 파일을 브라우저에서 직접 열거나, 간단한 HTTP 서버를 실행합니다:

```bash
# Python 내장 서버 사용
python3 -m http.server 8080
```

그 후 브라우저에서 `http://localhost:8080/index.html`을 엽니다.

## 빠른 시작 (한 번에 실행)

### 방법 1: 스크립트 사용 (권장)

```bash
./START.sh
```

### 방법 2: 수동 실행

```bash
# 백엔드 서버 백그라운드 실행
python3 backend.py > backend.log 2>&1 &

# 프론트엔드 서버 실행
python3 -m http.server 8080
```

브라우저에서 `http://localhost:8080`을 열고 회원가입 후 게임을 시작하세요!

## 접속 정보

- **게임 플레이**: http://localhost:8080
- **API 문서**: http://localhost:8001/docs
- **리더보드**: http://localhost:8080/leaderboard.html

## 파일 구조

```
tetris/
├── backend.py           # FastAPI 백엔드 서버
├── tetris.db           # SQLite 데이터베이스 (자동 생성)
├── index.html          # 랜딩 페이지
├── auth.html           # 로그인/회원가입 페이지
├── game.html           # 게임 플레이 페이지
├── leaderboard.html    # 리더보드 페이지
├── game.js             # 게임 로직
├── style.css           # 스타일시트
└── requirements.txt    # Python 의존성
```

## API 엔드포인트

### 인증
- `POST /api/signup` - 회원가입
- `POST /api/login` - 로그인
- `POST /api/logout` - 로그아웃

### 게임 기록
- `POST /api/game-records` - 게임 기록 저장
- `GET /api/leaderboard` - 리더보드 조회
- `GET /api/top-score` - 최고 점수 조회
- `GET /api/my-stats` - 내 통계 조회
- `GET /api/my-history` - 내 플레이 이력 조회

## 게임 조작법

- `←` `→` : 블록 좌우 이동
- `↑` : 블록 회전
- `↓` : 빠른 낙하
- `Space` : 즉시 낙하
- `P` : 일시정지/재개

## 데이터베이스 스키마

### users
- id: INTEGER PRIMARY KEY
- email: TEXT UNIQUE
- password_hash: TEXT
- created_at: TIMESTAMP

### sessions
- token: TEXT PRIMARY KEY
- user_id: INTEGER
- created_at: TIMESTAMP

### game_records
- id: INTEGER PRIMARY KEY
- user_id: INTEGER
- score: INTEGER
- level: INTEGER
- lines: INTEGER
- played_at: TIMESTAMP

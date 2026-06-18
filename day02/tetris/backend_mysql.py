from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
import pymysql
import hashlib
import secrets
from datetime import datetime
from typing import Optional
import os

app = FastAPI(title="Tetris Backend API")

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()

# MySQL 연결 설정
DB_CONFIG = {
    "host": os.getenv("DB_HOST", "localhost"),
    "port": int(os.getenv("DB_PORT", 3306)),
    "user": os.getenv("DB_USER", "tetris_user"),
    "password": os.getenv("DB_PASSWORD", "tetris_password"),
    "database": os.getenv("DB_NAME", "tetris"),
    "charset": "utf8mb4",
    "cursorclass": pymysql.cursors.DictCursor
}


def get_db():
    """데이터베이스 연결 반환"""
    return pymysql.connect(**DB_CONFIG)


def init_db():
    """데이터베이스 초기화 및 테이블 생성"""
    conn = get_db()
    cursor = conn.cursor()

    # 사용자 테이블
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            password_hash VARCHAR(64) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_email (email)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    """)

    # 세션 토큰 테이블
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS sessions (
            token VARCHAR(64) PRIMARY KEY,
            user_id INT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            INDEX idx_user_id (user_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    """)

    # 게임 기록 테이블
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS game_records (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            score INT NOT NULL,
            level INT NOT NULL,
            lines INT NOT NULL,
            played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            INDEX idx_user_id (user_id),
            INDEX idx_score (score DESC),
            INDEX idx_played_at (played_at DESC)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    """)

    conn.commit()
    cursor.close()
    conn.close()


def hash_password(password: str) -> str:
    """비밀번호 해싱"""
    return hashlib.sha256(password.encode()).hexdigest()


def create_session(user_id: int) -> str:
    """세션 토큰 생성 및 저장"""
    token = secrets.token_urlsafe(32)
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO sessions (token, user_id) VALUES (%s, %s)", (token, user_id))
    conn.commit()
    cursor.close()
    conn.close()
    return token


def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> int:
    """토큰 검증 및 user_id 반환"""
    token = credentials.credentials
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT user_id FROM sessions WHERE token = %s", (token,))
    row = cursor.fetchone()
    cursor.close()
    conn.close()

    if not row:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    return row["user_id"]


# Request/Response 모델
class SignupRequest(BaseModel):
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    token: str
    email: str


class GameRecordRequest(BaseModel):
    score: int
    level: int
    lines: int


class GameRecordResponse(BaseModel):
    id: int
    score: int
    level: int
    lines: int
    played_at: str


class LeaderboardEntry(BaseModel):
    email: str
    score: int
    level: int
    lines: int
    played_at: str


class UserStatsResponse(BaseModel):
    total_games: int
    best_score: int
    total_lines: int
    avg_score: float


# API 엔드포인트
@app.on_event("startup")
async def startup():
    """애플리케이션 시작 시 데이터베이스 초기화"""
    init_db()


@app.post("/api/signup", response_model=TokenResponse)
async def signup(req: SignupRequest):
    """회원가입"""
    conn = get_db()
    cursor = conn.cursor()

    # 이메일 중복 체크
    cursor.execute("SELECT id FROM users WHERE email = %s", (req.email,))
    if cursor.fetchone():
        cursor.close()
        conn.close()
        raise HTTPException(status_code=400, detail="Email already registered")

    # 사용자 생성
    password_hash = hash_password(req.password)
    cursor.execute(
        "INSERT INTO users (email, password_hash) VALUES (%s, %s)",
        (req.email, password_hash)
    )
    user_id = cursor.lastrowid
    conn.commit()
    cursor.close()
    conn.close()

    # 세션 토큰 생성
    token = create_session(user_id)

    return TokenResponse(token=token, email=req.email)


@app.post("/api/login", response_model=TokenResponse)
async def login(req: LoginRequest):
    """로그인"""
    conn = get_db()
    cursor = conn.cursor()

    password_hash = hash_password(req.password)
    cursor.execute(
        "SELECT id, email FROM users WHERE email = %s AND password_hash = %s",
        (req.email, password_hash)
    )
    row = cursor.fetchone()
    cursor.close()
    conn.close()

    if not row:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    user_id = row["id"]
    email = row["email"]

    # 세션 토큰 생성
    token = create_session(user_id)

    return TokenResponse(token=token, email=email)


@app.post("/api/logout")
async def logout(user_id: int = Depends(verify_token), credentials: HTTPAuthorizationCredentials = Depends(security)):
    """로그아웃"""
    token = credentials.credentials
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM sessions WHERE token = %s", (token,))
    conn.commit()
    cursor.close()
    conn.close()

    return {"message": "Logged out successfully"}


@app.post("/api/game-records", response_model=GameRecordResponse)
async def save_game_record(record: GameRecordRequest, user_id: int = Depends(verify_token)):
    """게임 기록 저장"""
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        "INSERT INTO game_records (user_id, score, level, lines) VALUES (%s, %s, %s, %s)",
        (user_id, record.score, record.level, record.lines)
    )
    record_id = cursor.lastrowid

    cursor.execute(
        "SELECT id, score, level, lines, played_at FROM game_records WHERE id = %s",
        (record_id,)
    )
    row = cursor.fetchone()
    conn.commit()
    cursor.close()
    conn.close()

    return GameRecordResponse(
        id=row["id"],
        score=row["score"],
        level=row["level"],
        lines=row["lines"],
        played_at=str(row["played_at"])
    )


@app.get("/api/leaderboard", response_model=list[LeaderboardEntry])
async def get_leaderboard(limit: int = 10):
    """리더보드 조회"""
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT u.email, gr.score, gr.level, gr.lines, gr.played_at
        FROM game_records gr
        JOIN users u ON gr.user_id = u.id
        ORDER BY gr.score DESC
        LIMIT %s
    """, (limit,))

    rows = cursor.fetchall()
    cursor.close()
    conn.close()

    return [
        LeaderboardEntry(
            email=row["email"],
            score=row["score"],
            level=row["level"],
            lines=row["lines"],
            played_at=str(row["played_at"])
        )
        for row in rows
    ]


@app.get("/api/top-score")
async def get_top_score():
    """최고 점수 조회"""
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT u.email, gr.score, gr.level, gr.lines, gr.played_at
        FROM game_records gr
        JOIN users u ON gr.user_id = u.id
        ORDER BY gr.score DESC
        LIMIT 1
    """)

    row = cursor.fetchone()
    cursor.close()
    conn.close()

    if not row:
        return {"message": "No records yet"}

    return {
        "email": row["email"],
        "score": row["score"],
        "level": row["level"],
        "lines": row["lines"],
        "played_at": str(row["played_at"])
    }


@app.get("/api/my-stats", response_model=UserStatsResponse)
async def get_my_stats(user_id: int = Depends(verify_token)):
    """사용자 통계 조회"""
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            COUNT(*) as total_games,
            COALESCE(MAX(score), 0) as best_score,
            COALESCE(SUM(lines), 0) as total_lines,
            COALESCE(AVG(score), 0) as avg_score
        FROM game_records
        WHERE user_id = %s
    """, (user_id,))

    row = cursor.fetchone()
    cursor.close()
    conn.close()

    return UserStatsResponse(
        total_games=row["total_games"],
        best_score=row["best_score"],
        total_lines=row["total_lines"],
        avg_score=round(row["avg_score"], 1)
    )


@app.get("/api/my-history", response_model=list[GameRecordResponse])
async def get_my_history(user_id: int = Depends(verify_token), limit: int = 20):
    """사용자 플레이 이력 조회"""
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT id, score, level, lines, played_at
        FROM game_records
        WHERE user_id = %s
        ORDER BY played_at DESC
        LIMIT %s
    """, (user_id, limit))

    rows = cursor.fetchall()
    cursor.close()
    conn.close()

    return [
        GameRecordResponse(
            id=row["id"],
            score=row["score"],
            level=row["level"],
            lines=row["lines"],
            played_at=str(row["played_at"])
        )
        for row in rows
    ]


@app.get("/")
async def root():
    """루트 엔드포인트"""
    return {"message": "Tetris Backend API", "version": "2.0.0", "database": "MySQL"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)

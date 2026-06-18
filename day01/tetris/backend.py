from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
import sqlite3
import hashlib
import secrets
from datetime import datetime
from typing import Optional

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

DB_PATH = "tetris.db"


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db()
    cursor = conn.cursor()

    # 사용자 테이블
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # 세션 토큰 테이블
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS sessions (
            token TEXT PRIMARY KEY,
            user_id INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    """)

    # 게임 기록 테이블
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS game_records (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            score INTEGER NOT NULL,
            level INTEGER NOT NULL,
            lines INTEGER NOT NULL,
            played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    """)

    conn.commit()
    conn.close()


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


def create_session(user_id: int) -> str:
    token = secrets.token_urlsafe(32)
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO sessions (token, user_id) VALUES (?, ?)", (token, user_id))
    conn.commit()
    conn.close()
    return token


def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> int:
    token = credentials.credentials
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT user_id FROM sessions WHERE token = ?", (token,))
    row = cursor.fetchone()
    conn.close()

    if not row:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    return row[0]


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
    init_db()


@app.post("/api/signup", response_model=TokenResponse)
async def signup(req: SignupRequest):
    conn = get_db()
    cursor = conn.cursor()

    # 이메일 중복 체크
    cursor.execute("SELECT id FROM users WHERE email = ?", (req.email,))
    if cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=400, detail="Email already registered")

    # 사용자 생성
    password_hash = hash_password(req.password)
    cursor.execute(
        "INSERT INTO users (email, password_hash) VALUES (?, ?)",
        (req.email, password_hash)
    )
    user_id = cursor.lastrowid
    conn.commit()
    conn.close()

    # 세션 토큰 생성
    token = create_session(user_id)

    return TokenResponse(token=token, email=req.email)


@app.post("/api/login", response_model=TokenResponse)
async def login(req: LoginRequest):
    conn = get_db()
    cursor = conn.cursor()

    password_hash = hash_password(req.password)
    cursor.execute(
        "SELECT id, email FROM users WHERE email = ? AND password_hash = ?",
        (req.email, password_hash)
    )
    row = cursor.fetchone()
    conn.close()

    if not row:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    user_id = row[0]
    email = row[1]

    # 세션 토큰 생성
    token = create_session(user_id)

    return TokenResponse(token=token, email=email)


@app.post("/api/logout")
async def logout(user_id: int = Depends(verify_token), credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM sessions WHERE token = ?", (token,))
    conn.commit()
    conn.close()

    return {"message": "Logged out successfully"}


@app.post("/api/game-records", response_model=GameRecordResponse)
async def save_game_record(record: GameRecordRequest, user_id: int = Depends(verify_token)):
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        "INSERT INTO game_records (user_id, score, level, lines) VALUES (?, ?, ?, ?)",
        (user_id, record.score, record.level, record.lines)
    )
    record_id = cursor.lastrowid

    cursor.execute(
        "SELECT id, score, level, lines, played_at FROM game_records WHERE id = ?",
        (record_id,)
    )
    row = cursor.fetchone()
    conn.commit()
    conn.close()

    return GameRecordResponse(
        id=row[0],
        score=row[1],
        level=row[2],
        lines=row[3],
        played_at=row[4]
    )


@app.get("/api/leaderboard", response_model=list[LeaderboardEntry])
async def get_leaderboard(limit: int = 10):
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT u.email, gr.score, gr.level, gr.lines, gr.played_at
        FROM game_records gr
        JOIN users u ON gr.user_id = u.id
        ORDER BY gr.score DESC
        LIMIT ?
    """, (limit,))

    rows = cursor.fetchall()
    conn.close()

    return [
        LeaderboardEntry(
            email=row[0],
            score=row[1],
            level=row[2],
            lines=row[3],
            played_at=row[4]
        )
        for row in rows
    ]


@app.get("/api/top-score")
async def get_top_score():
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
    conn.close()

    if not row:
        return {"message": "No records yet"}

    return {
        "email": row[0],
        "score": row[1],
        "level": row[2],
        "lines": row[3],
        "played_at": row[4]
    }


@app.get("/api/my-stats", response_model=UserStatsResponse)
async def get_my_stats(user_id: int = Depends(verify_token)):
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            COUNT(*) as total_games,
            MAX(score) as best_score,
            SUM(lines) as total_lines,
            AVG(score) as avg_score
        FROM game_records
        WHERE user_id = ?
    """, (user_id,))

    row = cursor.fetchone()
    conn.close()

    return UserStatsResponse(
        total_games=row[0] or 0,
        best_score=row[1] or 0,
        total_lines=row[2] or 0,
        avg_score=round(row[3], 1) if row[3] else 0.0
    )


@app.get("/api/my-history", response_model=list[GameRecordResponse])
async def get_my_history(user_id: int = Depends(verify_token), limit: int = 20):
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT id, score, level, lines, played_at
        FROM game_records
        WHERE user_id = ?
        ORDER BY played_at DESC
        LIMIT ?
    """, (user_id, limit))

    rows = cursor.fetchall()
    conn.close()

    return [
        GameRecordResponse(
            id=row[0],
            score=row[1],
            level=row[2],
            lines=row[3],
            played_at=row[4]
        )
        for row in rows
    ]


@app.get("/")
async def root():
    return {"message": "Tetris Backend API", "version": "1.0.0"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)

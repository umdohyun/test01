from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import sqlite3
from contextlib import contextmanager

app = FastAPI(title="메모장 API", description="SQLite 기반 메모장 CRUD API")

# CORS 설정 추가
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATABASE_NAME = "memos.db"


@contextmanager
def get_db():
    """데이터베이스 연결 컨텍스트 매니저"""
    conn = sqlite3.connect(DATABASE_NAME)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()


def init_db():
    """데이터베이스 초기화"""
    with get_db() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS memos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                content TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
        """)
        conn.commit()


class MemoCreate(BaseModel):
    title: str
    content: str


class MemoUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None


class MemoResponse(BaseModel):
    id: int
    title: str
    content: str
    created_at: str
    updated_at: str


@app.on_event("startup")
def startup():
    """앱 시작 시 데이터베이스 초기화"""
    init_db()


@app.get("/")
def root():
    return {"message": "메모장 API에 오신 것을 환영합니다! /docs에서 API를 테스트해보세요."}


@app.get("/memos", response_model=List[MemoResponse])
def get_all_memos():
    """모든 메모 조회"""
    with get_db() as conn:
        cursor = conn.execute(
            "SELECT id, title, content, created_at, updated_at FROM memos ORDER BY id DESC"
        )
        rows = cursor.fetchall()
        return [dict(row) for row in rows]


@app.get("/memos/{memo_id}", response_model=MemoResponse)
def get_memo(memo_id: int):
    """특정 메모 조회"""
    with get_db() as conn:
        cursor = conn.execute(
            "SELECT id, title, content, created_at, updated_at FROM memos WHERE id = ?",
            (memo_id,)
        )
        row = cursor.fetchone()
        if row is None:
            raise HTTPException(status_code=404, detail="메모를 찾을 수 없습니다")
        return dict(row)


@app.post("/memos", response_model=MemoResponse, status_code=201)
def create_memo(memo: MemoCreate):
    """새 메모 생성"""
    now = datetime.now().isoformat()

    with get_db() as conn:
        cursor = conn.execute(
            "INSERT INTO memos (title, content, created_at, updated_at) VALUES (?, ?, ?, ?)",
            (memo.title, memo.content, now, now)
        )
        conn.commit()
        memo_id = cursor.lastrowid

        cursor = conn.execute(
            "SELECT id, title, content, created_at, updated_at FROM memos WHERE id = ?",
            (memo_id,)
        )
        row = cursor.fetchone()
        return dict(row)


@app.put("/memos/{memo_id}", response_model=MemoResponse)
def update_memo(memo_id: int, memo: MemoUpdate):
    """메모 수정"""
    with get_db() as conn:
        # 메모 존재 확인
        cursor = conn.execute("SELECT id FROM memos WHERE id = ?", (memo_id,))
        if cursor.fetchone() is None:
            raise HTTPException(status_code=404, detail="메모를 찾을 수 없습니다")

        # 업데이트할 필드 준비
        updates = []
        params = []

        if memo.title is not None:
            updates.append("title = ?")
            params.append(memo.title)

        if memo.content is not None:
            updates.append("content = ?")
            params.append(memo.content)

        if updates:
            updates.append("updated_at = ?")
            params.append(datetime.now().isoformat())
            params.append(memo_id)

            conn.execute(
                f"UPDATE memos SET {', '.join(updates)} WHERE id = ?",
                params
            )
            conn.commit()

        # 업데이트된 메모 반환
        cursor = conn.execute(
            "SELECT id, title, content, created_at, updated_at FROM memos WHERE id = ?",
            (memo_id,)
        )
        row = cursor.fetchone()
        return dict(row)


@app.delete("/memos/{memo_id}")
def delete_memo(memo_id: int):
    """메모 삭제"""
    with get_db() as conn:
        # 삭제 전 메모 조회
        cursor = conn.execute(
            "SELECT id, title, content, created_at, updated_at FROM memos WHERE id = ?",
            (memo_id,)
        )
        row = cursor.fetchone()

        if row is None:
            raise HTTPException(status_code=404, detail="메모를 찾을 수 없습니다")

        deleted_memo = dict(row)

        # 메모 삭제
        conn.execute("DELETE FROM memos WHERE id = ?", (memo_id,))
        conn.commit()

        return {"message": "메모가 삭제되었습니다", "deleted_memo": deleted_memo}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

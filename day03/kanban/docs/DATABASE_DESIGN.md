# 칸반보드 - 데이터베이스 설계
## Database Design Document

---

## 1. 개요

### 1.1 목적
현재 칸반보드는 localStorage를 사용하는 클라이언트 전용 애플리케이션이지만, 향후 백엔드 연동 시 사용할 관계형 데이터베이스(PostgreSQL/MySQL) 스키마를 정의합니다.

### 1.2 데이터베이스 선택
| DBMS | 버전 | 사유 |
|------|------|------|
| PostgreSQL | 14+ | 권장 - JSONB, UUID, 풍부한 기능 |
| MySQL | 8.0+ | 대안 - 널리 사용, 성숙한 생태계 |

### 1.3 설계 원칙
- **정규화**: 제3정규형(3NF) 준수
- **확장성**: 향후 기능 추가 고려
- **성능**: 적절한 인덱싱
- **무결성**: 외래키 제약조건

---

## 2. 데이터 모델

### 2.1 ERD (Entity Relationship Diagram)

```
┌─────────────────┐          ┌─────────────────┐          ┌─────────────────┐
│      User       │          │      Board      │          │      Card       │
├─────────────────┤          ├─────────────────┤          ├─────────────────┤
│ • id (PK)       │──────┐   │ • id (PK)       │──────┐   │ • id (PK)       │
│ • email         │      │   │ • user_id (FK)  │      │   │ • board_id (FK) │
│ • password_hash │      │   │ • title         │      │   │ • title         │
│ • name          │      │   │ • description   │      │   │ • description   │
│ • created_at    │      └──→│ • created_at    │      └──→│ • status        │
│ • updated_at    │          │ • updated_at    │          │ • position      │
└─────────────────┘          └─────────────────┘          │ • priority      │
                                                            │ • created_at    │
                                                            │ • updated_at    │
                                                            │ • due_date      │
                                                            └─────────────────┘

                             ┌─────────────────┐
                             │     Column      │
                             ├─────────────────┤
                             │ • id (PK)       │
                             │ • board_id (FK) │
                             │ • title         │
                             │ • position      │
                             │ • created_at    │
                             └─────────────────┘
                                      │
                                      │
                        ┌─────────────┴─────────────┐
                        │                           │
                        ▼                           ▼
              ┌─────────────────┐          ┌─────────────────┐
              │   CardLabel     │          │   CardComment   │
              ├─────────────────┤          ├─────────────────┤
              │ • id (PK)       │          │ • id (PK)       │
              │ • card_id (FK)  │          │ • card_id (FK)  │
              │ • label_id (FK) │          │ • user_id (FK)  │
              └─────────────────┘          │ • content       │
                                            │ • created_at    │
              ┌─────────────────┐          └─────────────────┘
              │      Label      │
              ├─────────────────┤
              │ • id (PK)       │
              │ • board_id (FK) │
              │ • name          │
              │ • color         │
              └─────────────────┘
```

---

## 3. 테이블 스키마

### 3.1 users (사용자)

**용도**: 사용자 인증 및 프로필 정보

#### PostgreSQL
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    avatar_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);
```

#### MySQL
```sql
CREATE TABLE users (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    avatar_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP NULL,
    INDEX idx_users_email (email),
    INDEX idx_users_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**컬럼 설명**:
- `id`: UUID로 고유 식별
- `email`: 로그인 ID (유니크)
- `password_hash`: bcrypt/argon2로 해싱된 비밀번호
- `name`: 표시 이름
- `avatar_url`: 프로필 이미지 URL
- `last_login_at`: 마지막 로그인 시각

---

### 3.2 boards (보드)

**용도**: 칸반 보드 (사용자가 여러 보드 소유 가능)

#### PostgreSQL
```sql
CREATE TABLE boards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_boards_user_id ON boards(user_id);
CREATE INDEX idx_boards_is_archived ON boards(is_archived);
```

#### MySQL
```sql
CREATE TABLE boards (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_boards_user_id (user_id),
    INDEX idx_boards_is_archived (is_archived)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**컬럼 설명**:
- `user_id`: 보드 소유자
- `title`: 보드 제목 (예: "2026 Q3 프로젝트")
- `description`: 보드 설명
- `is_archived`: 아카이브 여부

---

### 3.3 columns (컬럼)

**용도**: 칸반 보드의 컬럼 (할 일, 진행중, 완료 등)

#### PostgreSQL
```sql
CREATE TABLE columns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    position INTEGER NOT NULL,
    color VARCHAR(7) DEFAULT '#667eea',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(board_id, position)
);

CREATE INDEX idx_columns_board_id ON columns(board_id);
CREATE INDEX idx_columns_position ON columns(board_id, position);
```

#### MySQL
```sql
CREATE TABLE columns (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    board_id CHAR(36) NOT NULL,
    title VARCHAR(100) NOT NULL,
    position INT NOT NULL,
    color VARCHAR(7) DEFAULT '#667eea',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE,
    UNIQUE KEY uk_columns_board_position (board_id, position),
    INDEX idx_columns_board_id (board_id),
    INDEX idx_columns_position (board_id, position)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**컬럼 설명**:
- `board_id`: 소속 보드
- `title`: 컬럼 제목 (예: "할 일", "진행중", "완료")
- `position`: 정렬 순서 (0, 1, 2, ...)
- `color`: 컬럼 헤더 색상 (HEX)

**기본 데이터**:
```sql
-- 보드 생성 시 자동으로 3개 컬럼 생성
INSERT INTO columns (board_id, title, position, color) VALUES
(?, '할 일', 0, '#667eea'),
(?, '진행중', 1, '#f59e0b'),
(?, '완료', 2, '#10b981');
```

---

### 3.4 cards (카드)

**용도**: 작업 카드 (현재 버전의 핵심 엔티티)

#### PostgreSQL
```sql
CREATE TABLE cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
    column_id UUID NOT NULL REFERENCES columns(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    position INTEGER NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    due_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(column_id, position)
);

CREATE INDEX idx_cards_board_id ON cards(board_id);
CREATE INDEX idx_cards_column_id ON cards(column_id);
CREATE INDEX idx_cards_position ON cards(column_id, position);
CREATE INDEX idx_cards_due_date ON cards(due_date);
CREATE INDEX idx_cards_priority ON cards(priority);
```

#### MySQL
```sql
CREATE TABLE cards (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    board_id CHAR(36) NOT NULL,
    column_id CHAR(36) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    position INT NOT NULL,
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    due_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE,
    FOREIGN KEY (column_id) REFERENCES columns(id) ON DELETE CASCADE,
    UNIQUE KEY uk_cards_column_position (column_id, position),
    INDEX idx_cards_board_id (board_id),
    INDEX idx_cards_column_id (column_id),
    INDEX idx_cards_position (column_id, position),
    INDEX idx_cards_due_date (due_date),
    INDEX idx_cards_priority (priority)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**컬럼 설명**:
- `board_id`: 소속 보드
- `column_id`: 현재 위치한 컬럼 (상태)
- `title`: 카드 제목
- `description`: 상세 설명 (Markdown 지원)
- `position`: 컬럼 내 정렬 순서
- `priority`: 우선순위 (낮음/보통/높음/긴급)
- `due_date`: 마감일
- `completed_at`: 완료 시각 (Done 컬럼 이동 시 기록)

---

### 3.5 labels (라벨)

**용도**: 카드 분류용 라벨 (선택 사항)

#### PostgreSQL
```sql
CREATE TABLE labels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    color VARCHAR(7) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(board_id, name)
);

CREATE INDEX idx_labels_board_id ON labels(board_id);
```

#### MySQL
```sql
CREATE TABLE labels (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    board_id CHAR(36) NOT NULL,
    name VARCHAR(50) NOT NULL,
    color VARCHAR(7) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE,
    UNIQUE KEY uk_labels_board_name (board_id, name),
    INDEX idx_labels_board_id (board_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 3.6 card_labels (카드-라벨 연결)

**용도**: 카드와 라벨의 N:M 관계

#### PostgreSQL
```sql
CREATE TABLE card_labels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
    label_id UUID NOT NULL REFERENCES labels(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(card_id, label_id)
);

CREATE INDEX idx_card_labels_card_id ON card_labels(card_id);
CREATE INDEX idx_card_labels_label_id ON card_labels(label_id);
```

#### MySQL
```sql
CREATE TABLE card_labels (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    card_id CHAR(36) NOT NULL,
    label_id CHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE,
    FOREIGN KEY (label_id) REFERENCES labels(id) ON DELETE CASCADE,
    UNIQUE KEY uk_card_labels (card_id, label_id),
    INDEX idx_card_labels_card_id (card_id),
    INDEX idx_card_labels_label_id (label_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 3.7 card_comments (카드 댓글)

**용도**: 카드에 대한 댓글 (선택 사항)

#### PostgreSQL
```sql
CREATE TABLE card_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_card_comments_card_id ON card_comments(card_id);
CREATE INDEX idx_card_comments_user_id ON card_comments(user_id);
```

#### MySQL
```sql
CREATE TABLE card_comments (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    card_id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_card_comments_card_id (card_id),
    INDEX idx_card_comments_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 4. 현재 버전 (localStorage) 매핑

### 4.1 localStorage → DB 매핑

| localStorage 필드 | DB 테이블.컬럼 | 변환 |
|-------------------|----------------|------|
| `id` (String) | `cards.id` (UUID) | 타임스탬프 → UUID |
| `title` | `cards.title` | 동일 |
| `status` ('todo'\|'in-progress'\|'done') | `cards.column_id` | Enum → FK (columns.id) |
| `createdAt` (ISO String) | `cards.created_at` | String → TIMESTAMP |

### 4.2 마이그레이션 전략

```javascript
// localStorage 데이터 읽기
const localCards = JSON.parse(localStorage.getItem('kanbanCards') || '[]');

// API로 전송
const migrateToBackend = async (cards) => {
  for (const card of cards) {
    const columnMap = {
      'todo': 'column_uuid_1',
      'in-progress': 'column_uuid_2',
      'done': 'column_uuid_3'
    };
    
    await fetch('/api/cards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: card.title,
        column_id: columnMap[card.status],
        position: 0, // 자동 계산
        created_at: card.createdAt
      })
    });
  }
};
```

---

## 5. SQL 쿼리 예시

### 5.1 보드의 모든 카드 조회 (컬럼별 그룹화)

```sql
SELECT 
    c.id AS column_id,
    c.title AS column_title,
    c.position AS column_position,
    json_agg(
        json_build_object(
            'id', ca.id,
            'title', ca.title,
            'description', ca.description,
            'priority', ca.priority,
            'position', ca.position,
            'due_date', ca.due_date,
            'created_at', ca.created_at
        ) ORDER BY ca.position
    ) AS cards
FROM columns c
LEFT JOIN cards ca ON c.id = ca.column_id
WHERE c.board_id = ?
GROUP BY c.id, c.title, c.position
ORDER BY c.position;
```

**결과 예시**:
```json
[
  {
    "column_id": "uuid-1",
    "column_title": "할 일",
    "column_position": 0,
    "cards": [
      {"id": "card-1", "title": "프로젝트 계획", ...},
      {"id": "card-2", "title": "UI 디자인", ...}
    ]
  },
  {
    "column_id": "uuid-2",
    "column_title": "진행중",
    "column_position": 1,
    "cards": [
      {"id": "card-3", "title": "API 개발", ...}
    ]
  }
]
```

### 5.2 카드 상태 변경 (드래그 앤 드롭)

```sql
-- 트랜잭션 시작
BEGIN;

-- 1. 카드의 컬럼 변경
UPDATE cards
SET column_id = ?, 
    position = ?,
    updated_at = CURRENT_TIMESTAMP
WHERE id = ?;

-- 2. 원래 컬럼의 다른 카드 위치 재조정
UPDATE cards
SET position = position - 1
WHERE column_id = ? AND position > ?;

-- 3. 새 컬럼의 다른 카드 위치 재조정
UPDATE cards
SET position = position + 1
WHERE column_id = ? AND position >= ?;

COMMIT;
```

### 5.3 카드 생성

```sql
-- 해당 컬럼의 마지막 위치 찾기
SELECT COALESCE(MAX(position), -1) + 1 AS next_position
FROM cards
WHERE column_id = ?;

-- 카드 삽입
INSERT INTO cards (board_id, column_id, title, position)
VALUES (?, ?, ?, ?);
```

### 5.4 카드 삭제

```sql
BEGIN;

-- 1. 카드 삭제 (CASCADE로 댓글/라벨도 자동 삭제)
DELETE FROM cards WHERE id = ?;

-- 2. 같은 컬럼의 뒤 카드들 위치 조정
UPDATE cards
SET position = position - 1
WHERE column_id = ? AND position > ?;

COMMIT;
```

### 5.5 사용자의 모든 보드 조회

```sql
SELECT 
    b.id,
    b.title,
    b.description,
    b.created_at,
    b.updated_at,
    (SELECT COUNT(*) FROM cards WHERE board_id = b.id) AS card_count
FROM boards b
WHERE b.user_id = ? AND b.is_archived = FALSE
ORDER BY b.updated_at DESC;
```

---

## 6. 인덱싱 전략

### 6.1 성능 최적화 인덱스

| 테이블 | 인덱스 | 사유 |
|--------|--------|------|
| cards | (column_id, position) | 드래그 앤 드롭 시 정렬 |
| cards | (board_id) | 보드별 카드 조회 |
| cards | (due_date) | 마감일 검색 |
| columns | (board_id, position) | 컬럼 정렬 |
| card_labels | (card_id, label_id) | N:M 조인 |

### 6.2 복합 인덱스 우선순위

```sql
-- 가장 자주 사용되는 쿼리
SELECT * FROM cards 
WHERE column_id = ? 
ORDER BY position;

-- 최적 인덱스
CREATE INDEX idx_cards_column_position ON cards(column_id, position);
```

---

## 7. 데이터 무결성

### 7.1 제약조건

#### 외래키 제약
- `boards.user_id` → `users.id` (ON DELETE CASCADE)
- `columns.board_id` → `boards.id` (ON DELETE CASCADE)
- `cards.board_id` → `boards.id` (ON DELETE CASCADE)
- `cards.column_id` → `columns.id` (ON DELETE CASCADE)

#### 유니크 제약
- `users.email` (중복 계정 방지)
- `(columns.board_id, columns.position)` (컬럼 순서 유일성)
- `(cards.column_id, cards.position)` (카드 순서 유일성)

#### 체크 제약
- `cards.priority IN ('low', 'medium', 'high', 'urgent')`

### 7.2 트리거 (선택 사항)

#### 카드 완료 시각 자동 기록
```sql
CREATE OR REPLACE FUNCTION update_completed_at()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.column_id != OLD.column_id THEN
        -- "완료" 컬럼으로 이동 시
        IF (SELECT title FROM columns WHERE id = NEW.column_id) = '완료' THEN
            NEW.completed_at = CURRENT_TIMESTAMP;
        ELSE
            NEW.completed_at = NULL;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_completed_at
BEFORE UPDATE ON cards
FOR EACH ROW
EXECUTE FUNCTION update_completed_at();
```

---

## 8. 백업 및 복구

### 8.1 PostgreSQL 백업

```bash
# 전체 덤프
pg_dump -U kanban_user -h localhost kanban_db > backup_$(date +%Y%m%d).sql

# 특정 테이블만
pg_dump -U kanban_user -h localhost -t cards -t columns kanban_db > cards_backup.sql

# 복구
psql -U kanban_user -h localhost kanban_db < backup_20260618.sql
```

### 8.2 MySQL 백업

```bash
# 전체 덤프
mysqldump -u kanban_user -p kanban_db > backup_$(date +%Y%m%d).sql

# 특정 테이블만
mysqldump -u kanban_user -p kanban_db cards columns > cards_backup.sql

# 복구
mysql -u kanban_user -p kanban_db < backup_20260618.sql
```

---

## 9. 마이그레이션 스크립트

### 9.1 초기 스키마 생성 (PostgreSQL)

```sql
-- schema.sql
BEGIN;

-- Users
CREATE TABLE users (...);

-- Boards
CREATE TABLE boards (...);

-- Columns
CREATE TABLE columns (...);

-- Cards
CREATE TABLE cards (...);

-- Labels
CREATE TABLE labels (...);

-- Card_Labels
CREATE TABLE card_labels (...);

-- Card_Comments
CREATE TABLE card_comments (...);

-- Indexes
CREATE INDEX ...;

COMMIT;
```

### 9.2 시드 데이터 (개발용)

```sql
-- seed.sql
BEGIN;

-- 테스트 사용자
INSERT INTO users (id, email, password_hash, name) VALUES
('11111111-1111-1111-1111-111111111111', 'test@example.com', '$2b$...', 'Test User');

-- 테스트 보드
INSERT INTO boards (id, user_id, title) VALUES
('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'My First Board');

-- 기본 컬럼
INSERT INTO columns (id, board_id, title, position) VALUES
('33333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', '할 일', 0),
('44444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', '진행중', 1),
('55555555-5555-5555-5555-555555555555', '22222222-2222-2222-2222-222222222222', '완료', 2);

-- 샘플 카드
INSERT INTO cards (board_id, column_id, title, position) VALUES
('22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', '프로젝트 계획 수립', 0),
('22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 'UI 디자인', 1),
('22222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444444', 'API 개발', 0),
('22222222-2222-2222-2222-222222222222', '55555555-5555-5555-5555-555555555555', '로그인 기능 구현', 0);

COMMIT;
```

---

## 10. API 엔드포인트 설계 (참고)

### 10.1 RESTful API

| Method | Endpoint | 설명 | 요청 Body | 응답 |
|--------|----------|------|-----------|------|
| GET | `/api/boards/:boardId/cards` | 보드의 모든 카드 조회 | - | `{columns: [...]}` |
| POST | `/api/boards/:boardId/cards` | 카드 생성 | `{title, column_id}` | `{card: {...}}` |
| PATCH | `/api/cards/:cardId` | 카드 수정 | `{title?, column_id?, position?}` | `{card: {...}}` |
| DELETE | `/api/cards/:cardId` | 카드 삭제 | - | `{success: true}` |
| PATCH | `/api/cards/:cardId/move` | 카드 이동 | `{column_id, position}` | `{card: {...}}` |

---

## 11. 성능 고려사항

### 11.1 쿼리 최적화
- **N+1 문제 방지**: JOIN 또는 eager loading 사용
- **페이지네이션**: 카드 개수가 많을 경우 LIMIT/OFFSET
- **캐싱**: Redis로 자주 조회되는 보드 캐싱

### 11.2 확장성
- **샤딩**: user_id 기반 수평 파티셔닝
- **읽기 복제**: Read Replica로 조회 성능 향상
- **아카이빙**: 오래된 보드는 별도 테이블로 이동

---

## 12. 보안

### 12.1 접근 제어
```sql
-- Row Level Security (PostgreSQL)
ALTER TABLE boards ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_boards_policy ON boards
FOR ALL
USING (user_id = current_setting('app.user_id')::UUID);
```

### 12.2 SQL Injection 방지
- **Prepared Statements**: 모든 쿼리에 파라미터 바인딩
- **ORM 사용**: Sequelize, Prisma, TypeORM 등

---

## 13. 문서 정보

- **작성일**: 2026-06-18
- **작성자**: Dohyun Um
- **버전**: 1.0
- **최종 수정일**: 2026-06-18
- **대상 DBMS**: PostgreSQL 14+ / MySQL 8.0+

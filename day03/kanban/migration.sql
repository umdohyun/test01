-- ============================================
-- 칸반보드 Phase 1: 데이터베이스 마이그레이션
-- ============================================
-- 실행: Supabase Dashboard > SQL Editor에 복사하여 실행
--
-- 주요 테이블:
-- 1. boards: 보드 정보 (소유자, 제목)
-- 2. cards: 카드 데이터 (기존 localStorage 구조)
-- 3. board_members: 보드 공유 멤버 (Phase 3에서 사용)
-- ============================================

-- ============================================
-- 1. boards 테이블
-- ============================================
-- 사용자가 여러 개의 보드를 소유할 수 있음
-- 기본적으로 사용자당 1개의 "내 칸반보드" 생성

CREATE TABLE IF NOT EXISTS boards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL DEFAULT '내 칸반보드',
    description TEXT,
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_boards_user_id ON boards(user_id);
CREATE INDEX IF NOT EXISTS idx_boards_is_archived ON boards(is_archived);

-- 업데이트 시각 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_boards_updated_at BEFORE UPDATE ON boards
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 2. cards 테이블
-- ============================================
-- 기존 localStorage 구조와 동일하게 유지
-- status: 'todo' | 'in-progress' | 'done'

CREATE TABLE IF NOT EXISTS cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'todo',
    position INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- 제약조건: status는 3가지 값만 허용
    CONSTRAINT cards_status_check CHECK (status IN ('todo', 'in-progress', 'done'))
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_cards_board_id ON cards(board_id);
CREATE INDEX IF NOT EXISTS idx_cards_status ON cards(board_id, status);
CREATE INDEX IF NOT EXISTS idx_cards_position ON cards(board_id, status, position);

-- 업데이트 시각 자동 갱신 트리거
CREATE TRIGGER update_cards_updated_at BEFORE UPDATE ON cards
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 3. board_members 테이블 (Phase 3에서 사용)
-- ============================================
-- 보드 공유를 위한 멤버 관리
-- role: 'owner' | 'editor' | 'viewer'

CREATE TABLE IF NOT EXISTS board_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL DEFAULT 'editor',
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- 제약조건: 한 보드에 같은 사용자 중복 방지
    UNIQUE(board_id, user_id),

    -- 제약조건: role은 3가지 값만 허용
    CONSTRAINT board_members_role_check CHECK (role IN ('owner', 'editor', 'viewer'))
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_board_members_board_id ON board_members(board_id);
CREATE INDEX IF NOT EXISTS idx_board_members_user_id ON board_members(user_id);

-- ============================================
-- 4. RLS (Row Level Security) 정책
-- ============================================
-- Supabase의 핵심 보안 기능
-- 사용자는 본인의 보드와 공유받은 보드만 접근 가능

-- RLS 활성화
ALTER TABLE boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_members ENABLE ROW LEVEL SECURITY;

-- boards 정책
-- 1. 자신의 보드만 조회 가능
CREATE POLICY "Users can view own boards"
    ON boards FOR SELECT
    USING (auth.uid() = user_id);

-- 2. 자신의 보드만 생성 가능
CREATE POLICY "Users can create own boards"
    ON boards FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 3. 자신의 보드만 수정 가능
CREATE POLICY "Users can update own boards"
    ON boards FOR UPDATE
    USING (auth.uid() = user_id);

-- 4. 자신의 보드만 삭제 가능
CREATE POLICY "Users can delete own boards"
    ON boards FOR DELETE
    USING (auth.uid() = user_id);

-- cards 정책
-- 1. 자신의 보드의 카드만 조회 가능
CREATE POLICY "Users can view cards in own boards"
    ON cards FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM boards
            WHERE boards.id = cards.board_id
            AND boards.user_id = auth.uid()
        )
    );

-- 2. 자신의 보드에만 카드 생성 가능
CREATE POLICY "Users can create cards in own boards"
    ON cards FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM boards
            WHERE boards.id = cards.board_id
            AND boards.user_id = auth.uid()
        )
    );

-- 3. 자신의 보드의 카드만 수정 가능
CREATE POLICY "Users can update cards in own boards"
    ON cards FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM boards
            WHERE boards.id = cards.board_id
            AND boards.user_id = auth.uid()
        )
    );

-- 4. 자신의 보드의 카드만 삭제 가능
CREATE POLICY "Users can delete cards in own boards"
    ON cards FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM boards
            WHERE boards.id = cards.board_id
            AND boards.user_id = auth.uid()
        )
    );

-- board_members 정책 (Phase 3에서 확장 예정)
-- 현재는 기본 정책만 설정
CREATE POLICY "Users can view own board memberships"
    ON board_members FOR SELECT
    USING (auth.uid() = user_id);

-- ============================================
-- 5. 초기 데이터 / 헬퍼 함수
-- ============================================

-- 사용자의 기본 보드 자동 생성 함수
CREATE OR REPLACE FUNCTION create_default_board_for_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO boards (user_id, title, description)
    VALUES (
        NEW.id,
        '내 칸반보드',
        '첫 번째 칸반보드입니다. 카드를 추가해보세요!'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 신규 사용자 가입 시 기본 보드 자동 생성 트리거
-- (이미 auth.users에 트리거가 있으면 주석 처리)
-- CREATE TRIGGER on_auth_user_created
--     AFTER INSERT ON auth.users
--     FOR EACH ROW EXECUTE FUNCTION create_default_board_for_user();

-- ============================================
-- 6. 데이터 확인 쿼리 (테스트용)
-- ============================================

-- 현재 로그인한 사용자의 보드 확인
-- SELECT * FROM boards WHERE user_id = auth.uid();

-- 현재 로그인한 사용자의 카드 확인
-- SELECT c.* FROM cards c
-- JOIN boards b ON b.id = c.board_id
-- WHERE b.user_id = auth.uid()
-- ORDER BY c.status, c.position;

-- ============================================
-- 완료!
-- ============================================
-- 다음 단계:
-- 1. Supabase Dashboard에서 테이블 생성 확인
-- 2. boardApi.js 작성 (JavaScript API)
-- 3. localStorage → Supabase 마이그레이션 함수
-- ============================================

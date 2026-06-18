-- ============================================
-- Supabase Realtime 설정
-- ============================================
-- Phase 2: 실시간 동기화를 위한 Realtime 활성화
--
-- 실행: Supabase Dashboard > SQL Editor에 복사하여 실행
-- ============================================

-- ============================================
-- 1. cards 테이블에 Realtime 활성화
-- ============================================
-- Realtime을 사용하려면 테이블에 REPLICA IDENTITY를 설정해야 합니다.
-- 이렇게 하면 UPDATE/DELETE 이벤트에서 old 값을 받을 수 있습니다.

ALTER TABLE cards REPLICA IDENTITY FULL;

-- ============================================
-- 2. Realtime Publication 확인
-- ============================================
-- Supabase는 기본적으로 'supabase_realtime' publication을 생성합니다.
-- cards 테이블이 이 publication에 포함되어 있는지 확인합니다.

-- Publication에 cards 테이블 추가 (이미 있으면 무시됨)
-- DO $$
-- BEGIN
--     IF NOT EXISTS (
--         SELECT 1 FROM pg_publication_tables
--         WHERE pubname = 'supabase_realtime'
--         AND tablename = 'cards'
--     ) THEN
--         ALTER PUBLICATION supabase_realtime ADD TABLE cards;
--     END IF;
-- END $$;

-- ============================================
-- 3. boards 테이블에도 Realtime 활성화 (선택)
-- ============================================
-- 보드 제목 변경 등을 실시간으로 동기화하려면 활성화

ALTER TABLE boards REPLICA IDENTITY FULL;

-- ============================================
-- 4. Realtime 확인 쿼리
-- ============================================
-- 아래 쿼리로 Realtime이 활성화되었는지 확인할 수 있습니다.

-- cards 테이블의 REPLICA IDENTITY 확인
SELECT
    schemaname,
    tablename,
    relreplident
FROM pg_tables t
JOIN pg_class c ON c.relname = t.tablename
WHERE tablename IN ('cards', 'boards')
AND schemaname = 'public';

-- 'f' = full (모든 컬럼 복제) - Realtime에 최적
-- 'd' = default (primary key만 복제)
-- 'n' = nothing (복제 없음)
-- 'i' = index (특정 인덱스 사용)

-- ============================================
-- 완료!
-- ============================================
-- Realtime 설정이 완료되었습니다.
--
-- 다음 단계:
-- 1. 브라우저에서 페이지 새로고침 (F5)
-- 2. 콘솔(F12) 확인: "✅ Realtime 구독 완료" 메시지
-- 3. 다른 브라우저/시크릿 창에서 같은 계정으로 로그인
-- 4. 한쪽에서 카드 추가/이동/삭제
-- 5. 다른 쪽에서 즉시 반영되는지 확인
-- ============================================

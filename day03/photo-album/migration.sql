-- ============================================
-- Photo Album - Database Migration
-- ============================================
-- Supabase Dashboard > SQL Editor에서 실행
-- ============================================

-- ============================================
-- 1. photos 테이블
-- ============================================
-- 사용자가 업로드한 사진 정보 저장

CREATE TABLE IF NOT EXISTS photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    file_path TEXT NOT NULL,
    url TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    original_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_photos_user_id ON photos(user_id);
CREATE INDEX IF NOT EXISTS idx_photos_created_at ON photos(user_id, created_at DESC);

-- 업데이트 시각 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_photos_updated_at BEFORE UPDATE ON photos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 2. user_settings 테이블
-- ============================================
-- 사용자별 앨범 순서 등 설정 저장

CREATE TABLE IF NOT EXISTS user_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    album_order JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);

-- 업데이트 시각 자동 갱신 트리거
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 3. Storage Bucket 생성
-- ============================================
-- Supabase Storage에서 사진을 저장할 버킷 생성

-- 주의: Storage 버킷은 SQL로 직접 생성할 수 없습니다.
-- Supabase Dashboard > Storage에서 수동으로 생성해야 합니다.
--
-- 버킷 생성 방법:
-- 1. Supabase Dashboard > Storage 이동
-- 2. "New bucket" 클릭
-- 3. Name: "photos"
-- 4. Public bucket: ✅ 체크 (공개 접근)
-- 5. Create bucket 클릭
--
-- 또는 아래 코드를 실행: (Supabase CLI 또는 관리자 권한 필요)

INSERT INTO storage.buckets (id, name, public)
VALUES ('photos', 'photos', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 4. RLS (Row Level Security) 정책
-- ============================================
-- 사용자는 본인의 사진만 접근 가능

-- RLS 활성화
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- photos 정책
-- 1. 자신의 사진만 조회
CREATE POLICY "Users can view own photos"
    ON photos FOR SELECT
    USING (auth.uid() = user_id);

-- 2. 자신의 사진만 업로드
CREATE POLICY "Users can upload own photos"
    ON photos FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 3. 자신의 사진만 수정
CREATE POLICY "Users can update own photos"
    ON photos FOR UPDATE
    USING (auth.uid() = user_id);

-- 4. 자신의 사진만 삭제
CREATE POLICY "Users can delete own photos"
    ON photos FOR DELETE
    USING (auth.uid() = user_id);

-- user_settings 정책
-- 1. 자신의 설정만 조회
CREATE POLICY "Users can view own settings"
    ON user_settings FOR SELECT
    USING (auth.uid() = user_id);

-- 2. 자신의 설정만 생성
CREATE POLICY "Users can create own settings"
    ON user_settings FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 3. 자신의 설정만 수정
CREATE POLICY "Users can update own settings"
    ON user_settings FOR UPDATE
    USING (auth.uid() = user_id);

-- ============================================
-- 5. Storage RLS 정책
-- ============================================
-- Storage bucket에 대한 접근 제어

-- photos 버킷 정책
-- 1. 자신의 폴더에만 업로드 가능
CREATE POLICY "Users can upload to own folder"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'photos' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

-- 2. 자신의 사진만 조회
CREATE POLICY "Users can view own photos in storage"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'photos' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

-- 3. 자신의 사진만 삭제
CREATE POLICY "Users can delete own photos in storage"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'photos' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

-- 4. Public bucket이므로 모두 다운로드 가능 (URL 알면)
-- (이미 public bucket으로 설정했으므로 별도 정책 불필요)

-- ============================================
-- 6. 헬퍼 함수
-- ============================================

-- 날짜별 사진 개수 조회
CREATE OR REPLACE FUNCTION get_photos_by_date(user_uuid UUID)
RETURNS TABLE (
    photo_date DATE,
    photo_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        created_at::DATE as photo_date,
        COUNT(*) as photo_count
    FROM photos
    WHERE user_id = user_uuid
    GROUP BY created_at::DATE
    ORDER BY created_at::DATE DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 7. 테스트 쿼리
-- ============================================

-- 현재 사용자의 사진 개수
-- SELECT COUNT(*) FROM photos WHERE user_id = auth.uid();

-- 날짜별 사진 개수
-- SELECT * FROM get_photos_by_date(auth.uid());

-- 최근 업로드된 사진 10장
-- SELECT * FROM photos WHERE user_id = auth.uid() ORDER BY created_at DESC LIMIT 10;

-- ============================================
-- 완료!
-- ============================================
-- 다음 단계:
-- 1. Supabase Dashboard에서 테이블 생성 확인
-- 2. Storage > photos 버킷 생성
-- 3. 앱에서 사진 업로드 테스트
-- ============================================

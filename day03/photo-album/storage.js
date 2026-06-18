// ============================================
// Storage API - Supabase Storage Layer
// ============================================
// 사진 업로드 및 관리를 위한 Supabase Storage API

/**
 * 사진 업로드
 * @param {File} file - 업로드할 파일
 * @param {string} userId - 사용자 ID
 * @returns {Promise<{success: boolean, url?: string, photo?: object, error?: string}>}
 */
async function uploadPhoto(file, userId) {
    if (!supabase) {
        return { success: false, error: 'Supabase가 초기화되지 않았습니다.' };
    }

    try {
        // 파일 유효성 검사
        if (!file.type.startsWith('image/')) {
            return { success: false, error: '이미지 파일만 업로드 가능합니다.' };
        }

        // 파일 크기 제한 (10MB)
        if (file.size > 10 * 1024 * 1024) {
            return { success: false, error: '파일 크기는 10MB 이하여야 합니다.' };
        }

        // 파일명 생성 (timestamp + random + original extension)
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(7);
        const extension = file.name.split('.').pop();
        const fileName = `${userId}/${timestamp}_${random}.${extension}`;

        // Supabase Storage에 업로드
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('photos')
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (uploadError) {
            console.error('업로드 오류:', uploadError);
            return { success: false, error: '파일 업로드에 실패했습니다.' };
        }

        // Public URL 가져오기
        const { data: urlData } = supabase.storage
            .from('photos')
            .getPublicUrl(fileName);

        if (!urlData || !urlData.publicUrl) {
            return { success: false, error: 'URL 생성에 실패했습니다.' };
        }

        // 데이터베이스에 사진 정보 저장
        const { data: photoData, error: dbError } = await supabase
            .from('photos')
            .insert({
                user_id: userId,
                file_path: fileName,
                url: urlData.publicUrl,
                file_size: file.size,
                mime_type: file.type,
                original_name: file.name
            })
            .select()
            .single();

        if (dbError) {
            console.error('DB 저장 오류:', dbError);
            // Storage에서 파일 삭제
            await supabase.storage.from('photos').remove([fileName]);
            return { success: false, error: '데이터베이스 저장에 실패했습니다.' };
        }

        return {
            success: true,
            url: urlData.publicUrl,
            photo: {
                id: photoData.id,
                url: urlData.publicUrl,
                created_at: photoData.created_at
            }
        };

    } catch (error) {
        console.error('uploadPhoto 오류:', error);
        return { success: false, error: '알 수 없는 오류가 발생했습니다.' };
    }
}

/**
 * 사용자의 모든 사진 가져오기
 * @param {string} userId - 사용자 ID
 * @returns {Promise<{success: boolean, photos?: array, error?: string}>}
 */
async function fetchPhotos(userId) {
    if (!supabase) {
        return { success: false, error: 'Supabase가 초기화되지 않았습니다.' };
    }

    try {
        const { data, error } = await supabase
            .from('photos')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('사진 조회 오류:', error);
            return { success: false, error: '사진을 불러올 수 없습니다.' };
        }

        return { success: true, photos: data || [] };

    } catch (error) {
        console.error('fetchPhotos 오류:', error);
        return { success: false, error: '알 수 없는 오류가 발생했습니다.' };
    }
}

/**
 * 사진 삭제
 * @param {string} photoId - 사진 ID
 * @param {string} filePath - 파일 경로
 * @returns {Promise<{success: boolean, error?: string}>}
 */
async function deletePhoto(photoId, filePath) {
    if (!supabase) {
        return { success: false, error: 'Supabase가 초기화되지 않았습니다.' };
    }

    try {
        // Storage에서 파일 삭제
        const { error: storageError } = await supabase.storage
            .from('photos')
            .remove([filePath]);

        if (storageError) {
            console.error('Storage 삭제 오류:', storageError);
            // Storage 삭제 실패해도 DB는 삭제 시도
        }

        // 데이터베이스에서 삭제
        const { error: dbError } = await supabase
            .from('photos')
            .delete()
            .eq('id', photoId);

        if (dbError) {
            console.error('DB 삭제 오류:', dbError);
            return { success: false, error: '사진 삭제에 실패했습니다.' };
        }

        return { success: true };

    } catch (error) {
        console.error('deletePhoto 오류:', error);
        return { success: false, error: '알 수 없는 오류가 발생했습니다.' };
    }
}

/**
 * 앨범 순서 업데이트
 * @param {string} userId - 사용자 ID
 * @param {array} albumOrder - 날짜별 앨범 순서 배열
 * @returns {Promise<{success: boolean, error?: string}>}
 */
async function updateAlbumOrder(userId, albumOrder) {
    if (!supabase) {
        return { success: false, error: 'Supabase가 초기화되지 않았습니다.' };
    }

    try {
        // 사용자 설정 테이블에 순서 저장
        const { error } = await supabase
            .from('user_settings')
            .upsert({
                user_id: userId,
                album_order: albumOrder
            }, {
                onConflict: 'user_id'
            });

        if (error) {
            console.error('앨범 순서 저장 오류:', error);
            return { success: false, error: '앨범 순서 저장에 실패했습니다.' };
        }

        return { success: true };

    } catch (error) {
        console.error('updateAlbumOrder 오류:', error);
        return { success: false, error: '알 수 없는 오류가 발생했습니다.' };
    }
}

/**
 * 앨범 순서 가져오기
 * @param {string} userId - 사용자 ID
 * @returns {Promise<{success: boolean, order?: array, error?: string}>}
 */
async function getAlbumOrder(userId) {
    if (!supabase) {
        return { success: false, error: 'Supabase가 초기화되지 않았습니다.' };
    }

    try {
        const { data, error } = await supabase
            .from('user_settings')
            .select('album_order')
            .eq('user_id', userId)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
            console.error('앨범 순서 조회 오류:', error);
            return { success: false, error: '앨범 순서를 불러올 수 없습니다.' };
        }

        return {
            success: true,
            order: data?.album_order || []
        };

    } catch (error) {
        console.error('getAlbumOrder 오류:', error);
        return { success: false, error: '알 수 없는 오류가 발생했습니다.' };
    }
}

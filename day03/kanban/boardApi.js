// ============================================
// Board API - Supabase Database Layer
// ============================================
// localStorage를 대체하는 Supabase PostgreSQL API
// Phase 1: 데이터베이스 CRUD 구현

/**
 * 현재 사용자의 기본 보드 가져오기 (없으면 생성)
 * @returns {Promise<{success: boolean, board?: object, error?: string}>}
 */
async function getOrCreateDefaultBoard() {
    if (!supabase) {
        return { success: false, error: 'Supabase가 초기화되지 않았습니다.' };
    }

    try {
        // 현재 사용자 확인
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            return { success: false, error: '로그인이 필요합니다.' };
        }

        // 사용자의 보드 조회
        const { data: boards, error: selectError } = await supabase
            .from('boards')
            .select('*')
            .eq('user_id', user.id)
            .eq('is_archived', false)
            .order('created_at', { ascending: true })
            .limit(1);

        if (selectError) {
            console.error('보드 조회 오류:', selectError);
            return { success: false, error: '보드를 불러올 수 없습니다.' };
        }

        // 보드가 있으면 반환
        if (boards && boards.length > 0) {
            return { success: true, board: boards[0] };
        }

        // 보드가 없으면 생성
        const { data: newBoard, error: insertError } = await supabase
            .from('boards')
            .insert({
                user_id: user.id,
                title: '내 칸반보드',
                description: '첫 번째 칸반보드입니다. 카드를 추가해보세요!'
            })
            .select()
            .single();

        if (insertError) {
            console.error('보드 생성 오류:', insertError);
            return { success: false, error: '보드를 생성할 수 없습니다.' };
        }

        console.log('✅ 기본 보드 생성:', newBoard.id);
        return { success: true, board: newBoard };

    } catch (error) {
        console.error('getOrCreateDefaultBoard 오류:', error);
        return { success: false, error: '알 수 없는 오류가 발생했습니다.' };
    }
}

/**
 * 보드의 모든 카드 조회
 * @param {string} boardId - 보드 ID
 * @returns {Promise<{success: boolean, cards?: array, error?: string}>}
 */
async function fetchCards(boardId) {
    if (!supabase) {
        return { success: false, error: 'Supabase가 초기화되지 않았습니다.' };
    }

    try {
        const { data, error } = await supabase
            .from('cards')
            .select('*')
            .eq('board_id', boardId)
            .order('status', { ascending: true })
            .order('position', { ascending: true });

        if (error) {
            console.error('카드 조회 오류:', error);
            return { success: false, error: '카드를 불러올 수 없습니다.' };
        }

        // Supabase의 UUID를 문자열 id로 변환 (기존 코드 호환성)
        const cards = data.map(card => ({
            id: card.id,
            title: card.title,
            description: card.description || '',
            status: card.status,
            position: card.position,
            createdAt: card.created_at
        }));

        return { success: true, cards };

    } catch (error) {
        console.error('fetchCards 오류:', error);
        return { success: false, error: '알 수 없는 오류가 발생했습니다.' };
    }
}

/**
 * 카드 생성
 * @param {string} boardId - 보드 ID
 * @param {string} title - 카드 제목
 * @param {string} status - 카드 상태 ('todo' | 'in-progress' | 'done')
 * @returns {Promise<{success: boolean, card?: object, error?: string}>}
 */
async function createCard(boardId, title, status = 'todo') {
    if (!supabase) {
        return { success: false, error: 'Supabase가 초기화되지 않았습니다.' };
    }

    try {
        // 해당 상태의 마지막 position 찾기
        const { data: existingCards, error: selectError } = await supabase
            .from('cards')
            .select('position')
            .eq('board_id', boardId)
            .eq('status', status)
            .order('position', { ascending: false })
            .limit(1);

        if (selectError) {
            console.error('position 조회 오류:', selectError);
            return { success: false, error: '카드를 추가할 수 없습니다.' };
        }

        const newPosition = existingCards && existingCards.length > 0
            ? existingCards[0].position + 1
            : 0;

        // 카드 생성
        const { data, error } = await supabase
            .from('cards')
            .insert({
                board_id: boardId,
                title: title,
                status: status,
                position: newPosition
            })
            .select()
            .single();

        if (error) {
            console.error('카드 생성 오류:', error);
            return { success: false, error: '카드를 추가할 수 없습니다.' };
        }

        const card = {
            id: data.id,
            title: data.title,
            description: data.description || '',
            status: data.status,
            position: data.position,
            createdAt: data.created_at
        };

        return { success: true, card };

    } catch (error) {
        console.error('createCard 오류:', error);
        return { success: false, error: '알 수 없는 오류가 발생했습니다.' };
    }
}

/**
 * 카드 상태 변경 (드래그 앤 드롭)
 * @param {string} cardId - 카드 ID
 * @param {string} newStatus - 새 상태
 * @returns {Promise<{success: boolean, error?: string}>}
 */
async function updateCardStatus(cardId, newStatus) {
    if (!supabase) {
        return { success: false, error: 'Supabase가 초기화되지 않았습니다.' };
    }

    try {
        // 새 컬럼의 마지막 position 찾기
        const { data: card, error: getCardError } = await supabase
            .from('cards')
            .select('board_id')
            .eq('id', cardId)
            .single();

        if (getCardError) {
            console.error('카드 조회 오류:', getCardError);
            return { success: false, error: '카드를 찾을 수 없습니다.' };
        }

        const { data: lastCard, error: positionError } = await supabase
            .from('cards')
            .select('position')
            .eq('board_id', card.board_id)
            .eq('status', newStatus)
            .order('position', { ascending: false })
            .limit(1);

        if (positionError) {
            console.error('position 조회 오류:', positionError);
        }

        const newPosition = lastCard && lastCard.length > 0
            ? lastCard[0].position + 1
            : 0;

        // 카드 상태 업데이트
        const { error } = await supabase
            .from('cards')
            .update({
                status: newStatus,
                position: newPosition
            })
            .eq('id', cardId);

        if (error) {
            console.error('카드 상태 업데이트 오류:', error);
            return { success: false, error: '카드를 이동할 수 없습니다.' };
        }

        return { success: true };

    } catch (error) {
        console.error('updateCardStatus 오류:', error);
        return { success: false, error: '알 수 없는 오류가 발생했습니다.' };
    }
}

/**
 * 카드 삭제
 * @param {string} cardId - 카드 ID
 * @returns {Promise<{success: boolean, error?: string}>}
 */
async function deleteCard(cardId) {
    if (!supabase) {
        return { success: false, error: 'Supabase가 초기화되지 않았습니다.' };
    }

    try {
        const { error } = await supabase
            .from('cards')
            .delete()
            .eq('id', cardId);

        if (error) {
            console.error('카드 삭제 오류:', error);
            return { success: false, error: '카드를 삭제할 수 없습니다.' };
        }

        return { success: true };

    } catch (error) {
        console.error('deleteCard 오류:', error);
        return { success: false, error: '알 수 없는 오류가 발생했습니다.' };
    }
}

/**
 * localStorage → Supabase 마이그레이션
 * 기존 localStorage 데이터를 Supabase로 이전
 * @param {string} boardId - 대상 보드 ID
 * @returns {Promise<{success: boolean, migrated?: number, error?: string}>}
 */
async function migrateFromLocalStorage(boardId) {
    if (!supabase) {
        return { success: false, error: 'Supabase가 초기화되지 않았습니다.' };
    }

    try {
        // localStorage에서 기존 카드 가져오기
        const localData = localStorage.getItem('kanbanCards');
        if (!localData) {
            console.log('마이그레이션할 localStorage 데이터가 없습니다.');
            return { success: true, migrated: 0 };
        }

        const localCards = JSON.parse(localData);
        if (!Array.isArray(localCards) || localCards.length === 0) {
            console.log('마이그레이션할 카드가 없습니다.');
            return { success: true, migrated: 0 };
        }

        // Supabase에 이미 카드가 있는지 확인
        const { data: existingCards, error: checkError } = await supabase
            .from('cards')
            .select('id')
            .eq('board_id', boardId)
            .limit(1);

        if (checkError) {
            console.error('기존 카드 확인 오류:', checkError);
            return { success: false, error: '마이그레이션 준비 중 오류가 발생했습니다.' };
        }

        // 이미 카드가 있으면 마이그레이션 건너뛰기
        if (existingCards && existingCards.length > 0) {
            console.log('이미 Supabase에 카드가 있습니다. 마이그레이션을 건너뜁니다.');
            return { success: true, migrated: 0 };
        }

        // 카드들을 Supabase에 삽입
        const cardsToInsert = localCards.map((card, index) => ({
            board_id: boardId,
            title: card.title,
            description: card.description || '',
            status: card.status,
            position: index
        }));

        const { data, error } = await supabase
            .from('cards')
            .insert(cardsToInsert)
            .select();

        if (error) {
            console.error('카드 마이그레이션 오류:', error);
            return { success: false, error: '카드를 이전할 수 없습니다.' };
        }

        console.log(`✅ ${data.length}개의 카드를 localStorage에서 Supabase로 마이그레이션했습니다.`);

        // 마이그레이션 완료 후 localStorage 백업 및 제거
        localStorage.setItem('kanbanCards_backup', localData);
        localStorage.removeItem('kanbanCards');

        return { success: true, migrated: data.length };

    } catch (error) {
        console.error('migrateFromLocalStorage 오류:', error);
        return { success: false, error: '마이그레이션 중 오류가 발생했습니다.' };
    }
}

/**
 * 보드 제목 변경
 * @param {string} boardId - 보드 ID
 * @param {string} newTitle - 새 제목
 * @returns {Promise<{success: boolean, error?: string}>}
 */
async function updateBoardTitle(boardId, newTitle) {
    if (!supabase) {
        return { success: false, error: 'Supabase가 초기화되지 않았습니다.' };
    }

    try {
        const { error } = await supabase
            .from('boards')
            .update({ title: newTitle })
            .eq('id', boardId);

        if (error) {
            console.error('보드 제목 업데이트 오류:', error);
            return { success: false, error: '보드 제목을 변경할 수 없습니다.' };
        }

        return { success: true };

    } catch (error) {
        console.error('updateBoardTitle 오류:', error);
        return { success: false, error: '알 수 없는 오류가 발생했습니다.' };
    }
}

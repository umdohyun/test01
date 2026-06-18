// ============================================
// Realtime Sync - Supabase Realtime Layer
// ============================================
// Phase 2: 실시간 동기화 구현
// 여러 브라우저/사용자의 변경사항을 실시간으로 동기화

let realtimeChannel = null;
let isRealtimeEnabled = false;

/**
 * Realtime 구독 시작
 * @param {string} boardId - 구독할 보드 ID
 * @param {Function} onCardChange - 카드 변경 시 호출될 콜백
 */
function subscribeToBoard(boardId, onCardChange) {
    if (!supabase) {
        console.error('Supabase가 초기화되지 않았습니다.');
        return;
    }

    if (realtimeChannel) {
        console.log('기존 Realtime 구독 해제 중...');
        unsubscribeFromBoard();
    }

    console.log('🔄 Realtime 구독 시작:', boardId);

    // Realtime 채널 생성 및 구독
    realtimeChannel = supabase
        .channel(`board:${boardId}`)
        .on(
            'postgres_changes',
            {
                event: '*', // INSERT, UPDATE, DELETE 모두 감지
                schema: 'public',
                table: 'cards',
                filter: `board_id=eq.${boardId}`
            },
            (payload) => {
                console.log('📡 Realtime 이벤트 수신:', payload);
                handleRealtimeEvent(payload, onCardChange);
            }
        )
        .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
                isRealtimeEnabled = true;
                console.log('✅ Realtime 구독 완료');
            } else if (status === 'CHANNEL_ERROR') {
                isRealtimeEnabled = false;
                console.error('❌ Realtime 구독 오류');
            } else if (status === 'TIMED_OUT') {
                isRealtimeEnabled = false;
                console.error('❌ Realtime 구독 타임아웃');
            } else {
                console.log('🔄 Realtime 상태:', status);
            }
        });
}

/**
 * Realtime 구독 해제
 */
function unsubscribeFromBoard() {
    if (realtimeChannel) {
        supabase.removeChannel(realtimeChannel);
        realtimeChannel = null;
        isRealtimeEnabled = false;
        console.log('✅ Realtime 구독 해제 완료');
    }
}

/**
 * Realtime 이벤트 처리
 * @param {Object} payload - Supabase Realtime 페이로드
 * @param {Function} onCardChange - 카드 변경 콜백
 */
function handleRealtimeEvent(payload, onCardChange) {
    const { eventType, new: newRecord, old: oldRecord } = payload;

    switch (eventType) {
        case 'INSERT':
            console.log('➕ 카드 추가됨:', newRecord);
            if (onCardChange) {
                onCardChange({
                    type: 'INSERT',
                    card: formatCard(newRecord)
                });
            }
            break;

        case 'UPDATE':
            console.log('✏️ 카드 수정됨:', newRecord);
            if (onCardChange) {
                onCardChange({
                    type: 'UPDATE',
                    card: formatCard(newRecord),
                    oldCard: oldRecord ? formatCard(oldRecord) : null
                });
            }
            break;

        case 'DELETE':
            console.log('🗑️ 카드 삭제됨:', oldRecord);
            if (onCardChange) {
                onCardChange({
                    type: 'DELETE',
                    cardId: oldRecord.id
                });
            }
            break;

        default:
            console.log('❓ 알 수 없는 이벤트:', eventType);
    }
}

/**
 * Supabase 카드 레코드를 앱 포맷으로 변환
 * @param {Object} record - Supabase 레코드
 * @returns {Object} 포맷된 카드 객체
 */
function formatCard(record) {
    return {
        id: record.id,
        title: record.title,
        description: record.description || '',
        status: record.status,
        position: record.position,
        createdAt: record.created_at
    };
}

/**
 * Realtime 상태 확인
 * @returns {boolean} Realtime 활성화 여부
 */
function isRealtimeActive() {
    return isRealtimeEnabled;
}

/**
 * Realtime 재연결 시도
 * @param {string} boardId - 보드 ID
 * @param {Function} onCardChange - 카드 변경 콜백
 */
function reconnectRealtime(boardId, onCardChange) {
    console.log('🔄 Realtime 재연결 시도...');
    unsubscribeFromBoard();
    setTimeout(() => {
        subscribeToBoard(boardId, onCardChange);
    }, 1000);
}

/**
 * 페이지 언로드 시 Realtime 구독 해제
 */
window.addEventListener('beforeunload', () => {
    unsubscribeFromBoard();
});

// State management
let cards = [];
let draggedCard = null;
let currentUser = null;
let currentBoard = null; // 현재 활성 보드

// Load cards from Supabase
async function loadCards() {
    if (!currentBoard) {
        console.error('보드가 설정되지 않았습니다.');
        return;
    }

    // 로딩 표시
    showLoadingState();

    try {
        const result = await fetchCards(currentBoard.id);

        if (result.success) {
            cards = result.cards || [];
            console.log(`✅ ${cards.length}개의 카드를 불러왔습니다.`);
        } else {
            console.error('카드 로딩 실패:', result.error);
            alert('카드를 불러오는 중 오류가 발생했습니다.');
            cards = [];
        }
    } catch (error) {
        console.error('loadCards 오류:', error);
        cards = [];
    }

    renderBoard();
}

// Create card element
function createCardElement(card) {
    const cardEl = document.createElement('div');
    cardEl.className = 'card';
    cardEl.draggable = true;
    cardEl.dataset.id = card.id;

    cardEl.innerHTML = `
        <div class="card-content">
            <div class="card-title">${escapeHtml(card.title)}</div>
            <button class="card-delete" onclick="deleteCardFromUI('${card.id}')" title="삭제">×</button>
        </div>
    `;

    // Drag event listeners
    cardEl.addEventListener('dragstart', handleDragStart);
    cardEl.addEventListener('dragend', handleDragEnd);

    return cardEl;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Render the entire board
function renderBoard() {
    const statuses = ['todo', 'in-progress', 'done'];

    statuses.forEach(status => {
        const container = document.getElementById(`${status}-container`);
        const countEl = document.getElementById(`${status}-count`);

        // Clear container
        container.innerHTML = '';

        // Filter cards by status
        const statusCards = cards.filter(card => card.status === status);

        // Update count
        countEl.textContent = statusCards.length;

        // Render cards
        if (statusCards.length === 0) {
            container.innerHTML = '<div class="empty-state">카드를 드래그하거나 추가하세요</div>';
        } else {
            statusCards.forEach(card => {
                container.appendChild(createCardElement(card));
            });
        }
    });
}

// Add new card
async function addCard(title, status) {
    if (!title || !title.trim()) {
        alert('카드 제목을 입력해주세요.');
        return;
    }

    if (!currentBoard) {
        alert('보드가 설정되지 않았습니다.');
        return;
    }

    try {
        const result = await createCard(currentBoard.id, title.trim(), status);

        if (result.success) {
            console.log('✅ 카드 추가:', result.card);
            await loadCards(); // 카드 목록 새로고침
        } else {
            alert('카드 추가 실패: ' + result.error);
        }
    } catch (error) {
        console.error('addCard 오류:', error);
        alert('카드를 추가하는 중 오류가 발생했습니다.');
    }
}

// Delete card (UI 레이어)
async function deleteCardFromUI(id) {
    if (!confirm('이 카드를 삭제하시겠습니까?')) {
        return;
    }

    try {
        const result = await deleteCard(id); // boardApi.js의 함수 호출

        if (result.success) {
            console.log('✅ 카드 삭제:', id);
            await loadCards(); // 카드 목록 새로고침
        } else {
            alert('카드 삭제 실패: ' + result.error);
        }
    } catch (error) {
        console.error('deleteCard 오류:', error);
        alert('카드를 삭제하는 중 오류가 발생했습니다.');
    }
}

// Update card status (드래그 앤 드롭용)
async function updateCardStatusAsync(id, newStatus) {
    try {
        const result = await updateCardStatus(id, newStatus);

        if (result.success) {
            console.log('✅ 카드 이동:', id, '→', newStatus);
            await loadCards(); // 카드 목록 새로고침
        } else {
            alert('카드 이동 실패: ' + result.error);
        }
    } catch (error) {
        console.error('updateCardStatus 오류:', error);
        alert('카드를 이동하는 중 오류가 발생했습니다.');
    }
}

// Drag event handlers
function handleDragStart(e) {
    draggedCard = e.target;
    e.target.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.innerHTML);
}

function handleDragEnd(e) {
    e.target.classList.remove('dragging');
    draggedCard = null;

    // Clean up all drag-over classes
    document.querySelectorAll('.drag-over').forEach(el => {
        el.classList.remove('drag-over');
    });
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    return false;
}

function handleDragEnter(e) {
    const container = e.target.closest('.cards-container');
    if (container) {
        container.classList.add('drag-over');
    }
}

function handleDragLeave(e) {
    const container = e.target.closest('.cards-container');
    if (container && !container.contains(e.relatedTarget)) {
        container.classList.remove('drag-over');
    }
}

function handleDrop(e) {
    e.stopPropagation();
    e.preventDefault();

    const container = e.target.closest('.cards-container');
    if (!container || !draggedCard) return;

    const column = container.closest('.kanban-column');
    const newStatus = column.dataset.status;
    const cardId = draggedCard.dataset.id;

    // Remove drag-over class
    container.classList.remove('drag-over');

    // Update card status (async)
    updateCardStatusAsync(cardId, newStatus);
}

// 로딩 상태 표시
function showLoadingState() {
    const statuses = ['todo', 'in-progress', 'done'];
    statuses.forEach(status => {
        const container = document.getElementById(`${status}-container`);
        container.innerHTML = '<div class="empty-state">로딩 중...</div>';
    });
}

// Realtime 카드 변경 이벤트 핸들러
function handleRealtimeCardChange(event) {
    const { type, card, cardId } = event;

    console.log('📡 Realtime 이벤트 처리:', type, card || cardId);

    switch (type) {
        case 'INSERT':
            // 새 카드 추가 - 중복 방지
            if (!cards.find(c => c.id === card.id)) {
                cards.push(card);
                renderBoard();
                showNotification(`새 카드가 추가되었습니다: ${card.title}`);
            }
            break;

        case 'UPDATE':
            // 카드 업데이트
            const index = cards.findIndex(c => c.id === card.id);
            if (index !== -1) {
                cards[index] = card;
                renderBoard();
                showNotification(`카드가 이동되었습니다: ${card.title}`);
            } else {
                // 로컬에 없는 카드면 추가
                cards.push(card);
                renderBoard();
            }
            break;

        case 'DELETE':
            // 카드 삭제
            const deleteIndex = cards.findIndex(c => c.id === cardId);
            if (deleteIndex !== -1) {
                const deletedCard = cards[deleteIndex];
                cards.splice(deleteIndex, 1);
                renderBoard();
                showNotification(`카드가 삭제되었습니다: ${deletedCard.title}`);
            }
            break;
    }
}

// 알림 표시 (우측 상단 토스트)
function showNotification(message) {
    // 기존 알림 제거
    const existing = document.querySelector('.realtime-notification');
    if (existing) {
        existing.remove();
    }

    // 새 알림 생성
    const notification = document.createElement('div');
    notification.className = 'realtime-notification';
    notification.textContent = message;
    document.body.appendChild(notification);

    // 3초 후 자동 제거
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    // Check authentication
    const isAuthenticated = await checkAuth();

    if (!isAuthenticated) {
        window.location.href = 'login.html';
        return;
    }

    // Get current user
    currentUser = await getCurrentUser();

    if (currentUser) {
        document.getElementById('userName').textContent = getUserDisplayName(currentUser);
    }

    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', async () => {
        const result = await logout();
        if (result.success) {
            window.location.href = 'login.html';
        } else {
            alert('로그아웃 중 오류가 발생했습니다.');
        }
    });

    // 보드 초기화
    console.log('🔄 보드 초기화 중...');
    const boardResult = await getOrCreateDefaultBoard();

    if (!boardResult.success) {
        alert('보드를 불러올 수 없습니다: ' + boardResult.error);
        return;
    }

    currentBoard = boardResult.board;
    console.log('✅ 보드 로드:', currentBoard.title, currentBoard.id);

    // localStorage → Supabase 마이그레이션 (최초 1회)
    const migrationResult = await migrateFromLocalStorage(currentBoard.id);
    if (migrationResult.success && migrationResult.migrated > 0) {
        console.log(`✅ ${migrationResult.migrated}개의 카드를 마이그레이션했습니다.`);
        alert(`기존 ${migrationResult.migrated}개의 카드를 클라우드로 이전했습니다! 이제 다른 기기에서도 접근 가능합니다.`);
    }

    // Load and render cards
    await loadCards();

    // Realtime 구독 시작
    console.log('🔄 Realtime 구독 시작...');
    subscribeToBoard(currentBoard.id, handleRealtimeCardChange);

    // Add card button event
    document.getElementById('addBtn').addEventListener('click', async () => {
        const input = document.getElementById('cardInput');
        const status = document.getElementById('statusSelect').value;

        if (input.value.trim()) {
            await addCard(input.value, status);
            input.value = '';
            input.focus();
        }
    });

    // Enter key support
    document.getElementById('cardInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            document.getElementById('addBtn').click();
        }
    });

    // Attach drag event listeners to containers
    const containers = document.querySelectorAll('.cards-container');
    containers.forEach(container => {
        container.addEventListener('dragover', handleDragOver);
        container.addEventListener('dragenter', handleDragEnter);
        container.addEventListener('dragleave', handleDragLeave);
        container.addEventListener('drop', handleDrop);
    });
});

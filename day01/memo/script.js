const API_BASE = 'http://localhost:8000';

let isEditMode = false;
let currentEditId = null;

// DOM 요소
const memoForm = document.getElementById('memo-form');
const memoIdInput = document.getElementById('memo-id');
const memoTitleInput = document.getElementById('memo-title');
const memoContentInput = document.getElementById('memo-content');
const memosContainer = document.getElementById('memos-container');
const formTitle = document.getElementById('form-title');
const submitBtn = document.getElementById('submit-btn');
const submitText = document.getElementById('submit-text');
const cancelBtn = document.getElementById('cancel-btn');
const memoCount = document.getElementById('memo-count');

// 초기화
document.addEventListener('DOMContentLoaded', () => {
    loadMemos();
    setupEventListeners();
});

// 이벤트 리스너 설정
function setupEventListeners() {
    memoForm.addEventListener('submit', handleSubmit);
    cancelBtn.addEventListener('click', resetForm);
}

// 메모 로드
async function loadMemos() {
    try {
        const response = await fetch(`${API_BASE}/memos`);
        const memos = await response.json();

        memoCount.textContent = memos.length;

        if (memos.length === 0) {
            memosContainer.innerHTML = `
                <div class="empty-state">
                    <p>📭 아직 메모가 없습니다</p>
                    <p class="empty-subtitle">위의 폼을 사용해서 첫 메모를 작성해보세요!</p>
                </div>
            `;
            return;
        }

        memosContainer.innerHTML = memos.map(memo => createMemoCard(memo)).join('');
    } catch (error) {
        console.error('메모 로드 실패:', error);
        showToast('메모를 불러오는데 실패했습니다', 'error');
    }
}

// 메모 카드 생성
function createMemoCard(memo) {
    const createdDate = new Date(memo.created_at).toLocaleString('ko-KR');
    const updatedDate = new Date(memo.updated_at).toLocaleString('ko-KR');

    return `
        <div class="memo-card" data-id="${memo.id}">
            <h3>${escapeHtml(memo.title)}</h3>
            <p>${escapeHtml(memo.content)}</p>
            <div class="memo-meta">
                <div>작성: ${createdDate}</div>
                ${memo.created_at !== memo.updated_at ? `<div>수정: ${updatedDate}</div>` : ''}
            </div>
            <div class="memo-actions">
                <button class="btn-edit" onclick="editMemo(${memo.id})">✏️ 수정</button>
                <button class="btn-delete" onclick="deleteMemo(${memo.id})">🗑️ 삭제</button>
            </div>
        </div>
    `;
}

// HTML 이스케이프
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 폼 제출 처리
async function handleSubmit(e) {
    e.preventDefault();

    const title = memoTitleInput.value.trim();
    const content = memoContentInput.value.trim();

    if (!title || !content) {
        showToast('제목과 내용을 모두 입력해주세요', 'error');
        return;
    }

    if (isEditMode) {
        await updateMemo(currentEditId, title, content);
    } else {
        await createMemo(title, content);
    }
}

// 메모 생성
async function createMemo(title, content) {
    try {
        const response = await fetch(`${API_BASE}/memos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ title, content }),
        });

        if (response.ok) {
            showToast('메모가 추가되었습니다', 'success');
            resetForm();
            loadMemos();
        } else {
            throw new Error('메모 생성 실패');
        }
    } catch (error) {
        console.error('메모 생성 실패:', error);
        showToast('메모 추가에 실패했습니다', 'error');
    }
}

// 메모 수정 모드로 전환
async function editMemo(id) {
    try {
        const response = await fetch(`${API_BASE}/memos/${id}`);
        const memo = await response.json();

        isEditMode = true;
        currentEditId = id;

        memoIdInput.value = id;
        memoTitleInput.value = memo.title;
        memoContentInput.value = memo.content;

        formTitle.textContent = '메모 수정';
        submitText.textContent = '수정 완료';
        submitBtn.style.background = '#28a745';
        cancelBtn.style.display = 'block';

        window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
        console.error('메모 조회 실패:', error);
        showToast('메모를 불러오는데 실패했습니다', 'error');
    }
}

// 메모 업데이트
async function updateMemo(id, title, content) {
    try {
        const response = await fetch(`${API_BASE}/memos/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ title, content }),
        });

        if (response.ok) {
            showToast('메모가 수정되었습니다', 'success');
            resetForm();
            loadMemos();
        } else {
            throw new Error('메모 수정 실패');
        }
    } catch (error) {
        console.error('메모 수정 실패:', error);
        showToast('메모 수정에 실패했습니다', 'error');
    }
}

// 메모 삭제
async function deleteMemo(id) {
    if (!confirm('정말로 이 메모를 삭제하시겠습니까?')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/memos/${id}`, {
            method: 'DELETE',
        });

        if (response.ok) {
            showToast('메모가 삭제되었습니다', 'success');

            if (currentEditId === id) {
                resetForm();
            }

            loadMemos();
        } else {
            throw new Error('메모 삭제 실패');
        }
    } catch (error) {
        console.error('메모 삭제 실패:', error);
        showToast('메모 삭제에 실패했습니다', 'error');
    }
}

// 폼 리셋
function resetForm() {
    isEditMode = false;
    currentEditId = null;

    memoIdInput.value = '';
    memoTitleInput.value = '';
    memoContentInput.value = '';

    formTitle.textContent = '새 메모 작성';
    submitText.textContent = '메모 추가';
    submitBtn.style.background = '';
    cancelBtn.style.display = 'none';
}

// 토스트 메시지 표시
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast show ${type}`;

    setTimeout(() => {
        toast.className = 'toast';
    }, 3000);
}

// ============================================
// Photo Album - Main Script
// ============================================

// Global State
let currentUser = null;
let photos = [];
let albums = {};
let draggedAlbumDate = null;
let currentViewingPhotos = [];
let currentPhotoIndex = 0;

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
            window.location.href = '../kanban/login.html';
        } else {
            alert('로그아웃 중 오류가 발생했습니다.');
        }
    });

    // Load photos
    await loadPhotos();

    // Upload button
    document.getElementById('uploadBtn').addEventListener('click', () => {
        document.getElementById('photoInput').click();
    });

    // File input change
    document.getElementById('photoInput').addEventListener('change', handleFileUpload);

    // Modal close buttons
    document.getElementById('closeModal').addEventListener('click', closeAlbumModal);
    document.getElementById('closeViewer').addEventListener('click', closePhotoViewer);

    // Photo navigation
    document.getElementById('prevPhoto').addEventListener('click', showPrevPhoto);
    document.getElementById('nextPhoto').addEventListener('click', showNextPhoto);

    // Delete photo
    document.getElementById('deletePhotoBtn').addEventListener('click', handleDeletePhoto);

    // Close modals on background click
    document.getElementById('albumModal').addEventListener('click', (e) => {
        if (e.target.id === 'albumModal') {
            closeAlbumModal();
        }
    });

    document.getElementById('photoViewerModal').addEventListener('click', (e) => {
        if (e.target.id === 'photoViewerModal') {
            closePhotoViewer();
        }
    });
});

/**
 * 사진 로드
 */
async function loadPhotos() {
    const result = await fetchPhotos(currentUser.id);

    if (result.success) {
        photos = result.photos;
        organizeAlbums();
        await renderAlbums();
    } else {
        console.error('사진 로드 실패:', result.error);
        alert('사진을 불러오는 중 오류가 발생했습니다.');
    }
}

/**
 * 사진을 날짜별 앨범으로 구성
 */
function organizeAlbums() {
    albums = {};

    photos.forEach(photo => {
        const date = new Date(photo.created_at);
        const dateKey = formatDate(date);

        if (!albums[dateKey]) {
            albums[dateKey] = [];
        }

        albums[dateKey].push(photo);
    });
}

/**
 * 날짜 포맷 (YYYY-MM-DD)
 */
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * 날짜 표시 포맷 (YYYY년 MM월 DD일)
 */
function formatDateDisplay(dateString) {
    const [year, month, day] = dateString.split('-');
    return `${year}년 ${parseInt(month)}월 ${parseInt(day)}일`;
}

/**
 * 앨범 렌더링
 */
async function renderAlbums() {
    const container = document.getElementById('albumsContainer');

    // 앨범이 없으면 empty state 표시
    if (Object.keys(albums).length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📷</div>
                <h3>아직 앨범이 없습니다</h3>
                <p>사진을 업로드하면 자동으로 날짜별 앨범이 생성됩니다</p>
            </div>
        `;
        return;
    }

    // 저장된 앨범 순서 가져오기
    const orderResult = await getAlbumOrder(currentUser.id);
    let albumDates = Object.keys(albums);

    if (orderResult.success && orderResult.order.length > 0) {
        // 저장된 순서 적용
        const savedOrder = orderResult.order.filter(date => albums[date]);
        const newDates = albumDates.filter(date => !savedOrder.includes(date));
        albumDates = [...savedOrder, ...newDates];
    } else {
        // 기본 정렬 (최신순)
        albumDates.sort((a, b) => new Date(b) - new Date(a));
    }

    // 앨범 카드 렌더링
    container.innerHTML = albumDates.map(dateKey => {
        const albumPhotos = albums[dateKey];
        const count = albumPhotos.length;

        // 미리보기 사진 (최대 4장)
        const previewPhotos = albumPhotos.slice(0, 4);
        const gridClass = count === 1 ? 'single' : '';

        return `
            <div class="album-card"
                 draggable="true"
                 data-date="${dateKey}"
                 onclick="openAlbum('${dateKey}')">
                <div class="album-preview">
                    <div class="album-preview-grid ${gridClass}">
                        ${previewPhotos.map(photo => `
                            <img src="${photo.url}" alt="Photo" class="preview-photo">
                        `).join('')}
                    </div>
                    ${count > 4 ? `<div class="album-count">+${count - 4} more</div>` : ''}
                </div>
                <div class="album-info">
                    <div class="album-date">${formatDateDisplay(dateKey)}</div>
                    <div class="album-meta">
                        <span>📷 ${count}장</span>
                        <span>${formatAlbumTime(albumPhotos[0].created_at)}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    // 드래그 이벤트 리스너 추가
    attachDragListeners();
}

/**
 * 시간 포맷
 */
function formatAlbumTime(timestamp) {
    const date = new Date(timestamp);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
}

/**
 * 드래그 이벤트 리스너 부착
 */
function attachDragListeners() {
    const albumCards = document.querySelectorAll('.album-card');

    albumCards.forEach(card => {
        card.addEventListener('dragstart', handleAlbumDragStart);
        card.addEventListener('dragend', handleAlbumDragEnd);
        card.addEventListener('dragover', handleAlbumDragOver);
        card.addEventListener('drop', handleAlbumDrop);
    });
}

/**
 * 앨범 드래그 시작
 */
function handleAlbumDragStart(e) {
    draggedAlbumDate = e.target.dataset.date;
    e.target.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
}

/**
 * 앨범 드래그 종료
 */
function handleAlbumDragEnd(e) {
    e.target.classList.remove('dragging');
    draggedAlbumDate = null;
}

/**
 * 앨범 드래그 오버
 */
function handleAlbumDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
}

/**
 * 앨범 드롭
 */
async function handleAlbumDrop(e) {
    e.preventDefault();
    e.stopPropagation();

    const targetDate = e.currentTarget.dataset.date;

    if (draggedAlbumDate && targetDate && draggedAlbumDate !== targetDate) {
        // 앨범 순서 변경
        const albumDates = Object.keys(albums);
        const draggedIndex = albumDates.indexOf(draggedAlbumDate);
        const targetIndex = albumDates.indexOf(targetDate);

        albumDates.splice(draggedIndex, 1);
        albumDates.splice(targetIndex, 0, draggedAlbumDate);

        // 순서 저장
        await updateAlbumOrder(currentUser.id, albumDates);

        // 재렌더링
        await renderAlbums();
    }
}

/**
 * 파일 업로드 처리
 */
async function handleFileUpload(e) {
    const files = Array.from(e.target.files);

    if (files.length === 0) return;

    // 로딩 표시
    showLoading();

    let successCount = 0;
    let failCount = 0;

    for (const file of files) {
        const result = await uploadPhoto(file, currentUser.id);

        if (result.success) {
            successCount++;
        } else {
            failCount++;
            console.error('업로드 실패:', file.name, result.error);
        }
    }

    // 로딩 숨김
    hideLoading();

    // 결과 표시
    if (successCount > 0) {
        alert(`${successCount}장의 사진이 업로드되었습니다.${failCount > 0 ? ` (${failCount}장 실패)` : ''}`);
        await loadPhotos();
    } else {
        alert('사진 업로드에 실패했습니다.');
    }

    // Input 초기화
    e.target.value = '';
}

/**
 * 앨범 열기
 */
function openAlbum(dateKey) {
    // 이벤트 전파 방지 확인
    if (event && event.target.closest('.album-card').classList.contains('dragging')) {
        return;
    }

    currentViewingPhotos = albums[dateKey] || [];

    document.getElementById('modalAlbumTitle').textContent = formatDateDisplay(dateKey);

    const photosGrid = document.getElementById('photosGrid');
    photosGrid.innerHTML = currentViewingPhotos.map((photo, index) => `
        <div class="photo-item" onclick="openPhotoViewer(${index})">
            <img src="${photo.url}" alt="Photo">
        </div>
    `).join('');

    document.getElementById('albumModal').classList.add('active');
}

/**
 * 앨범 모달 닫기
 */
function closeAlbumModal() {
    document.getElementById('albumModal').classList.remove('active');
}

/**
 * 사진 뷰어 열기
 */
function openPhotoViewer(index) {
    currentPhotoIndex = index;
    showCurrentPhoto();
    document.getElementById('photoViewerModal').classList.add('active');
}

/**
 * 현재 사진 표시
 */
function showCurrentPhoto() {
    const photo = currentViewingPhotos[currentPhotoIndex];

    document.getElementById('viewerImage').src = photo.url;
    document.getElementById('viewerDate').textContent = new Date(photo.created_at).toLocaleString('ko-KR');

    // 네비게이션 버튼 표시/숨김
    document.getElementById('prevPhoto').style.display = currentPhotoIndex > 0 ? 'block' : 'none';
    document.getElementById('nextPhoto').style.display = currentPhotoIndex < currentViewingPhotos.length - 1 ? 'block' : 'none';
}

/**
 * 이전 사진
 */
function showPrevPhoto() {
    if (currentPhotoIndex > 0) {
        currentPhotoIndex--;
        showCurrentPhoto();
    }
}

/**
 * 다음 사진
 */
function showNextPhoto() {
    if (currentPhotoIndex < currentViewingPhotos.length - 1) {
        currentPhotoIndex++;
        showCurrentPhoto();
    }
}

/**
 * 사진 삭제
 */
async function handleDeletePhoto() {
    if (!confirm('이 사진을 삭제하시겠습니까?')) {
        return;
    }

    const photo = currentViewingPhotos[currentPhotoIndex];

    showLoading();

    const result = await deletePhoto(photo.id, photo.file_path);

    hideLoading();

    if (result.success) {
        alert('사진이 삭제되었습니다.');

        // 사진 목록에서 제거
        currentViewingPhotos.splice(currentPhotoIndex, 1);

        if (currentViewingPhotos.length === 0) {
            // 앨범에 사진이 없으면 모달 닫고 새로고침
            closePhotoViewer();
            closeAlbumModal();
            await loadPhotos();
        } else {
            // 다음 사진으로 이동 (또는 이전)
            if (currentPhotoIndex >= currentViewingPhotos.length) {
                currentPhotoIndex = currentViewingPhotos.length - 1;
            }
            showCurrentPhoto();

            // 앨범 모달 새로고침
            await loadPhotos();
            const dateKey = formatDate(new Date(currentViewingPhotos[0].created_at));
            openAlbum(dateKey);
        }
    } else {
        alert('사진 삭제에 실패했습니다: ' + result.error);
    }
}

/**
 * 사진 뷰어 닫기
 */
function closePhotoViewer() {
    document.getElementById('photoViewerModal').classList.remove('active');
}

/**
 * 로딩 표시
 */
function showLoading() {
    document.getElementById('loadingOverlay').classList.add('active');
}

/**
 * 로딩 숨김
 */
function hideLoading() {
    document.getElementById('loadingOverlay').classList.remove('active');
}

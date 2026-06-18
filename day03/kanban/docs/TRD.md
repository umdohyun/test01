# 칸반보드 - 기술 요구사항 정의서 (TRD)
## Technical Requirements Document

---

## 1. 기술 개요

### 1.1 아키텍처
**타입**: Single Page Application (SPA)  
**패턴**: Client-Side Only (No Backend)  
**저장소**: Browser localStorage

### 1.2 기술 스택

| 계층 | 기술 | 버전 | 사유 |
|------|------|------|------|
| 구조 | HTML5 | - | 시맨틱 마크업, Drag API 지원 |
| 스타일 | CSS3 | - | Flexbox, 반응형 디자인 |
| 로직 | Vanilla JavaScript | ES6+ | 외부 의존성 없음, 가벼움 |
| 폰트 | Google Fonts (Roboto) | - | 깔끔한 가독성 |
| 저장소 | localStorage | Web Storage API | 브라우저 네이티브, 설정 불필요 |

### 1.3 브라우저 지원
- Chrome 90+ (2021.04~)
- Firefox 88+ (2021.04~)
- Safari 14+ (2020.09~)
- Edge 90+ (2021.04~)

---

## 2. 시스템 아키텍처

### 2.1 전체 구조
```
┌─────────────────────────────────────┐
│         Browser (Client)            │
├─────────────────────────────────────┤
│  ┌───────────┐  ┌─────────────────┐ │
│  │ index.html│→ │   style.css     │ │
│  └─────┬─────┘  └─────────────────┘ │
│        ↓                             │
│  ┌─────────────────────────────────┐│
│  │         script.js               ││
│  ├─────────────────────────────────┤│
│  │ • State Management              ││
│  │ • Event Handlers                ││
│  │ • DOM Manipulation              ││
│  │ • localStorage Interface        ││
│  └────────┬────────────────────────┘│
│           ↓                          │
│  ┌─────────────────────────────────┐│
│  │      localStorage               ││
│  │   (Browser Storage)             ││
│  └─────────────────────────────────┘│
└─────────────────────────────────────┘
```

### 2.2 데이터 흐름
```
User Action → Event Handler → Update State
                                    ↓
                               Save to localStorage
                                    ↓
                               renderBoard()
                                    ↓
                              Update DOM
```

---

## 3. 데이터 구조

### 3.1 카드 객체 (Card)
```javascript
{
  id: String,           // 고유 식별자 (타임스탬프 기반)
  title: String,        // 카드 제목 (1-100자)
  status: Enum,         // 'todo' | 'in-progress' | 'done'
  createdAt: String     // ISO 8601 포맷 (YYYY-MM-DDTHH:mm:ss.sssZ)
}
```

**예시**:
```javascript
{
  id: "1718712000000",
  title: "API 개발",
  status: "in-progress",
  createdAt: "2026-06-18T10:20:00.000Z"
}
```

### 3.2 전역 상태 (Global State)
```javascript
// In-memory state
let cards = [];        // Array<Card>
let draggedCard = null; // HTMLElement | null
```

### 3.3 localStorage 스키마
**Key**: `kanbanCards`  
**Value**: JSON.stringify(cards)

```javascript
// localStorage.getItem('kanbanCards') 결과
'[{"id":"1","title":"프로젝트 계획","status":"todo","createdAt":"2026-06-18T10:00:00.000Z"}]'
```

---

## 4. API 설계

### 4.1 상태 관리 API

#### loadCards()
```javascript
/**
 * localStorage에서 카드 데이터를 로드하여 전역 상태에 저장
 * @returns {void}
 * @throws {Error} JSON 파싱 실패 시
 */
function loadCards() {
  try {
    const saved = localStorage.getItem('kanbanCards');
    cards = saved ? JSON.parse(saved) : getInitialCards();
  } catch (error) {
    console.error('Error loading cards:', error);
    cards = getInitialCards();
  }
}
```

#### saveCards()
```javascript
/**
 * 현재 전역 상태를 localStorage에 저장
 * @returns {void}
 * @throws {Error} 저장 용량 초과 시
 */
function saveCards() {
  try {
    localStorage.setItem('kanbanCards', JSON.stringify(cards));
  } catch (error) {
    console.error('Error saving cards:', error);
    // QuotaExceededError 처리
  }
}
```

### 4.2 CRUD 함수

#### addCard(title, status)
```javascript
/**
 * 새 카드를 생성하고 상태에 추가
 * @param {string} title - 카드 제목
 * @param {string} status - 초기 상태 ('todo'|'in-progress'|'done')
 * @returns {void}
 */
function addCard(title, status) {
  if (!title || !title.trim()) {
    alert('카드 제목을 입력해주세요.');
    return;
  }
  
  const card = {
    id: Date.now().toString(),
    title: title.trim(),
    status: status,
    createdAt: new Date().toISOString()
  };
  
  cards.push(card);
  saveCards();
  renderBoard();
}
```

#### deleteCard(id)
```javascript
/**
 * ID로 카드를 찾아 삭제
 * @param {string} id - 카드 ID
 * @returns {void}
 */
function deleteCard(id) {
  if (confirm('이 카드를 삭제하시겠습니까?')) {
    cards = cards.filter(card => card.id !== id);
    saveCards();
    renderBoard();
  }
}
```

#### updateCardStatus(id, newStatus)
```javascript
/**
 * 카드의 상태를 업데이트
 * @param {string} id - 카드 ID
 * @param {string} newStatus - 새로운 상태
 * @returns {void}
 */
function updateCardStatus(id, newStatus) {
  const card = cards.find(c => c.id === id);
  if (card) {
    card.status = newStatus;
    saveCards();
  }
}
```

### 4.3 렌더링 API

#### renderBoard()
```javascript
/**
 * 전체 보드를 재렌더링
 * @returns {void}
 */
function renderBoard() {
  const statuses = ['todo', 'in-progress', 'done'];
  
  statuses.forEach(status => {
    const container = document.getElementById(`${status}-container`);
    const countEl = document.getElementById(`${status}-count`);
    
    container.innerHTML = '';
    const statusCards = cards.filter(card => card.status === status);
    countEl.textContent = statusCards.length;
    
    if (statusCards.length === 0) {
      container.innerHTML = '<div class="empty-state">카드를 드래그하거나 추가하세요</div>';
    } else {
      statusCards.forEach(card => {
        container.appendChild(createCardElement(card));
      });
    }
  });
}
```

#### createCardElement(card)
```javascript
/**
 * 카드 객체로부터 DOM 엘리먼트 생성
 * @param {Card} card - 카드 데이터
 * @returns {HTMLElement} 카드 DOM 엘리먼트
 */
function createCardElement(card) {
  const cardEl = document.createElement('div');
  cardEl.className = 'card';
  cardEl.draggable = true;
  cardEl.dataset.id = card.id;
  
  cardEl.innerHTML = `
    <div class="card-content">
      <div class="card-title">${escapeHtml(card.title)}</div>
      <button class="card-delete" onclick="deleteCard('${card.id}')">×</button>
    </div>
  `;
  
  cardEl.addEventListener('dragstart', handleDragStart);
  cardEl.addEventListener('dragend', handleDragEnd);
  
  return cardEl;
}
```

### 4.4 Drag & Drop 이벤트 핸들러

#### handleDragStart(e)
```javascript
/**
 * 드래그 시작 시 호출
 * @param {DragEvent} e - 드래그 이벤트
 */
function handleDragStart(e) {
  draggedCard = e.target;
  e.target.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/html', e.target.innerHTML);
}
```

#### handleDragOver(e)
```javascript
/**
 * 드래그 영역 위를 지날 때 호출 (필수!)
 * @param {DragEvent} e - 드래그 이벤트
 */
function handleDragOver(e) {
  e.preventDefault(); // 드롭 허용
  e.dataTransfer.dropEffect = 'move';
  return false;
}
```

#### handleDrop(e)
```javascript
/**
 * 드롭 시 호출
 * @param {DragEvent} e - 드래그 이벤트
 */
function handleDrop(e) {
  e.stopPropagation();
  e.preventDefault();
  
  const container = e.target.closest('.cards-container');
  if (!container || !draggedCard) return;
  
  const column = container.closest('.kanban-column');
  const newStatus = column.dataset.status;
  const cardId = draggedCard.dataset.id;
  
  updateCardStatus(cardId, newStatus);
  container.classList.remove('drag-over');
  renderBoard();
}
```

---

## 5. HTML 구조

### 5.1 페이지 구조
```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>칸반 보드</title>
  <link rel="stylesheet" href="style.css">
  <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">
</head>
<body>
  <div class="container">
    <header>...</header>
    <div class="kanban-board">...</div>
    <div class="add-card-section">...</div>
  </div>
  <script src="script.js"></script>
</body>
</html>
```

### 5.2 컴포넌트 계층 구조
```
container
├── header
│   └── h1
├── kanban-board
│   ├── kanban-column (data-status="todo")
│   │   ├── column-header
│   │   │   ├── h2
│   │   │   └── card-count
│   │   └── cards-container
│   │       └── card (draggable="true", data-id="...")
│   │           └── card-content
│   │               ├── card-title
│   │               └── card-delete
│   ├── kanban-column (data-status="in-progress")
│   └── kanban-column (data-status="done")
└── add-card-section
    ├── input#cardInput
    ├── select#statusSelect
    └── button#addBtn
```

---

## 6. CSS 설계

### 6.1 레이아웃 시스템
**방식**: Flexbox  
**반응형**: Mobile-First + Media Queries

```css
/* Desktop (default) */
.kanban-board {
  display: flex;
  gap: 20px;
}

/* Tablet */
@media (max-width: 992px) {
  .kanban-board {
    flex-direction: column;
  }
}

/* Mobile */
@media (max-width: 768px) {
  .add-card-section {
    flex-direction: column;
  }
}
```

### 6.2 색상 팔레트
| 용도 | 색상 코드 | 설명 |
|------|-----------|------|
| Primary | `#667eea` | 주요 액션 버튼, 하이라이트 |
| Secondary | `#764ba2` | 그라데이션 보조 색상 |
| Background | `linear-gradient(135deg, #667eea 0%, #764ba2 100%)` | 배경 그라데이션 |
| Card BG | `#ffffff` | 카드 배경 |
| Border | `#e0e0e0` | 테두리 |
| Text | `#333333` | 본문 텍스트 |
| Text Light | `#999999` | 보조 텍스트 |

### 6.3 타이포그래피
```css
font-family: 'Roboto', sans-serif;

h1: 2.5rem / 700    /* 헤더 */
h2: 1.25rem / 500   /* 컬럼 제목 */
body: 1rem / 400    /* 본문 */
small: 0.875rem     /* 카드 개수 */
```

### 6.4 애니메이션
```css
/* 카드 호버 */
.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  transition: all 0.2s ease;
}

/* 드래그 상태 */
.card.dragging {
  opacity: 0.5;
  cursor: grabbing;
}

/* 드롭 영역 하이라이트 */
.cards-container.drag-over {
  background: rgba(102, 126, 234, 0.1);
  border: 2px dashed #667eea;
  transition: background 0.2s, border 0.2s;
}
```

---

## 7. JavaScript 구조

### 7.1 모듈 구조
```javascript
// 전역 상태
let cards = [];
let draggedCard = null;

// 초기화
document.addEventListener('DOMContentLoaded', init);

// 유틸리티
function escapeHtml(text) { ... }

// 상태 관리
function loadCards() { ... }
function saveCards() { ... }

// CRUD
function addCard(title, status) { ... }
function deleteCard(id) { ... }
function updateCardStatus(id, newStatus) { ... }

// 렌더링
function renderBoard() { ... }
function createCardElement(card) { ... }

// 이벤트 핸들러
function handleDragStart(e) { ... }
function handleDragOver(e) { ... }
function handleDragEnter(e) { ... }
function handleDragLeave(e) { ... }
function handleDrop(e) { ... }
function handleDragEnd(e) { ... }
```

### 7.2 초기화 흐름
```javascript
document.addEventListener('DOMContentLoaded', () => {
  // 1. 데이터 로드
  loadCards();
  
  // 2. 초기 렌더링
  renderBoard();
  
  // 3. 이벤트 리스너 등록
  document.getElementById('addBtn').addEventListener('click', handleAddCard);
  document.getElementById('cardInput').addEventListener('keypress', handleKeyPress);
  
  // 4. 드래그 이벤트 등록
  document.querySelectorAll('.cards-container').forEach(container => {
    container.addEventListener('dragover', handleDragOver);
    container.addEventListener('dragenter', handleDragEnter);
    container.addEventListener('dragleave', handleDragLeave);
    container.addEventListener('drop', handleDrop);
  });
});
```

---

## 8. 보안 고려사항

### 8.1 XSS 방지
```javascript
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;  // textContent는 자동으로 이스케이프
  return div.innerHTML;
}

// 사용
cardEl.innerHTML = `<div class="card-title">${escapeHtml(card.title)}</div>`;
```

### 8.2 입력 검증
```javascript
function addCard(title, status) {
  // 1. 빈 값 체크
  if (!title || !title.trim()) {
    alert('카드 제목을 입력해주세요.');
    return;
  }
  
  // 2. 길이 제한 (HTML maxlength와 이중 체크)
  if (title.length > 100) {
    alert('제목은 100자 이내로 입력해주세요.');
    return;
  }
  
  // 3. 상태 값 검증
  const validStatuses = ['todo', 'in-progress', 'done'];
  if (!validStatuses.includes(status)) {
    console.error('Invalid status:', status);
    return;
  }
  
  // ...
}
```

### 8.3 에러 처리
```javascript
try {
  localStorage.setItem('kanbanCards', JSON.stringify(cards));
} catch (error) {
  if (error.name === 'QuotaExceededError') {
    alert('저장 공간이 부족합니다. 일부 카드를 삭제해주세요.');
  } else {
    console.error('Error saving cards:', error);
  }
}
```

---

## 9. 성능 최적화

### 9.1 렌더링 최적화
- **전체 렌더링**: 카드 추가/삭제/이동 시 전체 보드 재렌더링
- **이유**: 카드 개수가 적어 성능 영향 미미, 코드 단순성 우선
- **향후 개선**: Virtual DOM, Incremental Rendering (100개 이상 시)

### 9.2 이벤트 위임
```javascript
// ❌ 나쁜 예: 각 카드마다 이벤트 리스너
cards.forEach(card => {
  card.addEventListener('click', handleClick);
});

// ✅ 좋은 예: 컨테이너에 위임
container.addEventListener('click', (e) => {
  if (e.target.classList.contains('card-delete')) {
    deleteCard(e.target.closest('.card').dataset.id);
  }
});
```

### 9.3 메모리 관리
- **이벤트 리스너 정리**: 재렌더링 시 자동으로 제거됨 (innerHTML 덮어쓰기)
- **전역 변수 최소화**: `cards`, `draggedCard` 2개만 사용

---

## 10. 테스트 전략

### 10.1 수동 테스트 (Manual Testing)
#### 기능 테스트
- [ ] 카드 생성: 각 컬럼에 추가
- [ ] 카드 삭제: 확인 다이얼로그 후 삭제
- [ ] 드래그 앤 드롭: 3개 컬럼 간 모든 조합
- [ ] 데이터 영속성: 새로고침 후 데이터 유지
- [ ] 빈 입력 검증: 경고 메시지 표시

#### 브라우저 테스트
- [ ] Chrome 90+
- [ ] Firefox 88+
- [ ] Safari 14+
- [ ] Edge 90+

#### 반응형 테스트
- [ ] Desktop (1920x1080)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

### 10.2 성능 테스트
```javascript
// 렌더링 시간 측정
console.time('renderBoard');
renderBoard();
console.timeEnd('renderBoard');

// localStorage 크기 확인
const data = localStorage.getItem('kanbanCards');
console.log('Data size:', new Blob([data]).size, 'bytes');
```

### 10.3 에러 시나리오
- [ ] localStorage 비활성화 시
- [ ] localStorage 용량 초과 시
- [ ] 손상된 JSON 데이터 시
- [ ] 네트워크 오프라인 시 (Google Fonts)

---

## 11. 배포 요구사항

### 11.1 파일 구조
```
kanban/
├── index.html
├── style.css
├── script.js
└── docs/
    ├── PLAN.md
    ├── PRD.md
    ├── TRD.md
    ├── USER_FLOW.md
    ├── DATABASE_DESIGN.md
    ├── DESIGN_SYSTEM.md
    └── TASKS.md
```

### 11.2 배포 방법
1. **로컬 실행**
   ```bash
   python3 -m http.server 8000
   # http://localhost:8000
   ```

2. **GitHub Pages**
   - Repository에 push
   - Settings > Pages > Source: main branch

3. **Netlify/Vercel**
   - 드래그 앤 드롭으로 폴더 업로드
   - 즉시 배포 완료

### 11.3 최소 요구사항
- 웹 서버 (정적 파일 서빙)
- HTTPS (선택, 권장)

---

## 12. 향후 기술 개선 사항

### 12.1 v1.1 (Enhancement)
- Service Worker를 통한 완전한 오프라인 지원
- IndexedDB로 마이그레이션 (용량 확장)
- 카드 인라인 편집 (contenteditable)

### 12.2 v2.0 (Backend Integration)
- RESTful API 구현
- PostgreSQL/MySQL 연동
- JWT 인증

### 12.3 v3.0 (Real-time Collaboration)
- WebSocket 실시간 동기화
- 다중 사용자 동시 편집
- Operational Transformation (OT)

---

## 13. 참고 문서

### 13.1 표준 및 API
- [HTML5 Drag and Drop API](https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API)
- [Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API)
- [Flexbox Layout](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Flexible_Box_Layout)

### 13.2 Best Practices
- [Google JavaScript Style Guide](https://google.github.io/styleguide/jsguide.html)
- [Airbnb CSS / Sass Styleguide](https://github.com/airbnb/css)

---

## 14. 버전 정보

- **문서 버전**: 1.0
- **작성일**: 2026-06-18
- **작성자**: Dohyun Um
- **최종 수정일**: 2026-06-18

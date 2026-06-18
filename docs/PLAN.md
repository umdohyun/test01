# 칸반보드 구현 계획

## Context
사용자가 HTML, CSS, JavaScript를 사용하여 드래그 앤 드롭 기능을 가진 칸반보드를 만들려고 합니다. 이 칸반보드는 To-do, In-progress, Done의 3개 컬럼을 가지며, 카드를 컬럼 간에 드래그하여 이동할 수 있어야 합니다. 각 파일은 별도로 분리되어야 하며, 외부 라이브러리 없이 순수 바닐라 JavaScript로 구현합니다.

## 구현 방식

### 1. 기술 스택
- **HTML5 Drag and Drop API**: 브라우저 네이티브 API 사용 (라이브러리 불필요)
- **CSS Flexbox**: 3개 컬럼 레이아웃
- **Vanilla JavaScript**: 드래그 이벤트 핸들링 및 상태 관리
- **localStorage**: 카드 데이터 영구 저장

### 2. 파일 구조
```
/home/ubuntu/work/kosa-vibecoding-2026-3rd/src/exercise/umdohy/day03/kanban/
├── index.html    # 메인 구조 (헤더 + 3개 컬럼)
├── style.css     # 레이아웃, 드래그 상태, 반응형 디자인
├── script.js     # 드래그 핸들러, 상태 관리, localStorage
└── docs/         # 설계 문서
    ├── PLAN.md
    ├── PRD.md
    ├── TRD.md
    ├── USER_FLOW.md
    ├── DATABASE_DESIGN.md
    ├── DESIGN_SYSTEM.md
    └── TASKS.md
```

### 3. 데이터 구조
```javascript
{
  id: '고유 ID (타임스탬프)',
  title: '카드 제목',
  status: 'todo' | 'in-progress' | 'done',
  createdAt: '생성 시간'
}
```

## 구현 계획

### Phase 1: HTML 구조 (index.html)

**주요 컴포넌트:**
1. **헤더**: 제목 + 새 카드 추가 버튼
2. **칸반 보드**: 3개의 컬럼 컨테이너
   - 각 컬럼: 헤더(제목 + 카드 개수) + 카드 컨테이너
   - 각 컬럼에 `data-status` 속성으로 상태 구분
3. **카드 추가 섹션**: 입력창 + 상태 선택 드롭다운 + 추가 버튼
4. **카드**: `draggable="true"` 속성 + `data-id` 속성

### Phase 2: CSS 스타일링 (style.css)

**주요 스타일 영역:**

1. **베이스 스타일**
   - Google Fonts (Roboto) 임포트
   - 그라데이션 배경
   - 박스 사이징 리셋

2. **칸반 보드 레이아웃**
   - `.kanban-board`: `display: flex` + `gap: 20px`
   - `.kanban-column`: `flex: 1` (균등 분배) + 흰색 배경 + 그림자

3. **카드 스타일**
   - 배경색, 둥근 모서리, 패딩
   - `cursor: grab` (잡을 수 있음 표시)
   - hover 시 transform + 그림자 증가
   - transition으로 부드러운 애니메이션

4. **드래그 상태**
   - `.card.dragging`: `opacity: 0.5` + `cursor: grabbing`
   - `.cards-container.drag-over`: 테두리 색상 변경 + 반투명 배경

5. **반응형 디자인**
   - 768px 이하: 컬럼 세로 스택

### Phase 3: JavaScript 로직 (script.js)

**핵심 함수:**

1. **상태 관리**: `loadCards()`, `saveCards()`
2. **렌더링**: `renderBoard()`, `createCardElement()`
3. **드래그 이벤트**: `handleDragStart()`, `handleDragOver()`, `handleDrop()`, `handleDragEnd()`
4. **카드 관리**: `addCard()`, `deleteCard()`, `updateCardStatus()`

## HTML5 Drag and Drop API 기술 상세

**드래그 앤 드롭 흐름:**
1. `dragstart`: 드래그 시작 - 드래그할 카드 저장, 스타일 변경
2. `dragover`: 드롭 영역 위 - preventDefault() 호출 (필수!)
3. `dragenter`: 드롭 영역 진입 - 하이라이트 표시
4. `dragleave`: 드롭 영역 이탈 - 하이라이트 제거
5. `drop`: 드롭 - 카드 상태 업데이트, 재렌더링
6. `dragend`: 드래그 종료 - 정리 작업

## 주요 기능

1. ✅ 카드를 드래그하여 컬럼 간 이동
2. ✅ 새 카드 추가 (제목 + 초기 상태 선택)
3. ✅ 카드 삭제
4. ✅ 드래그 중 시각적 피드백
5. ✅ localStorage로 데이터 영구 저장
6. ✅ 반응형 디자인 (데스크톱/태블릿/모바일)

## 구현 순서

1. **HTML 기본 구조** 작성
2. **CSS 기본 스타일** 적용 (레이아웃, 컬럼, 카드)
3. **JavaScript 초기 렌더링** (샘플 데이터 표시)
4. **카드 추가 기능** 구현
5. **드래그 앤 드롭 핵심 로직** 구현
6. **시각적 피드백** 추가
7. **localStorage 연동**
8. **삭제 기능 및 폴리싱**

## 검증 방법

1. **브라우저에서 index.html 열기**
   ```bash
   cd /home/ubuntu/work/kosa-vibecoding-2026-3rd/src/exercise/umdohy/day03/kanban
   python3 -m http.server 8000
   ```

2. **기능 테스트**
   - 초기 샘플 카드 4개가 각 컬럼에 표시되는지 확인
   - 카드를 드래그하여 다른 컬럼으로 이동
   - 새 카드 추가 폼으로 카드 생성
   - 페이지 새로고침 후 데이터 유지 확인

3. **개발자 도구 확인**
   - Console에 에러가 없는지 확인
   - Application > Local Storage에서 데이터 저장 확인

## 알려진 제약사항

1. **터치 디바이스**: HTML5 Drag API는 모바일 터치에서 제한적으로 작동
2. **동시 편집**: 여러 탭에서 동시 편집 시 localStorage 동기화 안 됨
3. **데이터 제한**: localStorage 5MB 제한

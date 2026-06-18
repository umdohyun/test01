# 칸반보드 - 디자인 시스템
## Design System Document

---

## 1. 디자인 원칙

### 1.1 핵심 가치
- **단순성 (Simplicity)**: 최소한의 인터페이스로 최대한의 기능
- **명확성 (Clarity)**: 모든 요소가 직관적이고 이해하기 쉬움
- **일관성 (Consistency)**: 전체 앱에서 통일된 디자인 패턴
- **반응성 (Responsiveness)**: 모든 디바이스에서 최적화된 경험

### 1.2 디자인 철학
> "드래그 앤 드롭이라는 자연스러운 제스처를 통해, 복잡한 작업 관리를 단순하게 만든다."

---

## 2. 색상 시스템

### 2.1 브랜드 컬러

#### Primary Colors
```css
--primary-500: #667eea;      /* 메인 브랜드 컬러 */
--primary-600: #5a67d8;      /* Hover 상태 */
--primary-700: #4c51bf;      /* Active 상태 */
```

**사용처**:
- 주요 액션 버튼 (추가 버튼)
- 드롭 영역 하이라이트
- 링크 및 강조 텍스트

#### Secondary Colors
```css
--secondary-500: #764ba2;    /* 보조 브랜드 컬러 */
--secondary-600: #6b4394;    /* Hover 상태 */
```

**사용처**:
- 그라데이션 보조 색상
- 아이콘 강조

### 2.2 기능 컬러

#### Background
```css
--bg-primary: #ffffff;           /* 카드, 컬럼 배경 */
--bg-secondary: #f5f7fa;         /* 컬럼 헤더 */
--bg-tertiary: #fafafa;          /* 카드 hover */
--bg-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);  /* 페이지 배경 */
```

#### Text
```css
--text-primary: #333333;         /* 본문 텍스트 */
--text-secondary: #666666;       /* 보조 텍스트 */
--text-tertiary: #999999;        /* 비활성/힌트 텍스트 */
--text-inverse: #ffffff;         /* 어두운 배경 위 텍스트 */
```

#### Border
```css
--border-light: #e0e0e0;         /* 기본 테두리 */
--border-medium: #cccccc;        /* 강조 테두리 */
--border-dark: #999999;          /* 선택 테두리 */
```

#### State Colors
```css
--success: #10b981;              /* 완료 상태 */
--warning: #f59e0b;              /* 진행중 상태 */
--info: #3b82f6;                 /* 정보 */
--error: #e53e3e;                /* 에러, 삭제 */
```

### 2.3 색상 팔레트 테이블

| 색상 | HEX | RGB | 용도 |
|------|-----|-----|------|
| Primary | `#667eea` | `rgb(102, 126, 234)` | 버튼, 하이라이트 |
| Secondary | `#764ba2` | `rgb(118, 75, 162)` | 그라데이션 |
| Success | `#10b981` | `rgb(16, 185, 129)` | 완료 컬럼 |
| Warning | `#f59e0b` | `rgb(245, 158, 11)` | 진행중 컬럼 |
| Error | `#e53e3e` | `rgb(229, 62, 62)` | 삭제 버튼 |
| Gray 100 | `#f5f7fa` | `rgb(245, 247, 250)` | 배경 |
| Gray 200 | `#e0e0e0` | `rgb(224, 224, 224)` | 테두리 |
| Gray 600 | `#666666` | `rgb(102, 102, 102)` | 보조 텍스트 |
| Gray 900 | `#333333` | `rgb(51, 51, 51)` | 본문 텍스트 |

### 2.4 컬러 접근성

**WCAG 2.1 AA 레벨 준수**

| 조합 | 대비율 | 통과 |
|------|--------|------|
| `#333333` on `#ffffff` | 12.6:1 | ✅ AAA |
| `#667eea` on `#ffffff` | 4.8:1 | ✅ AA |
| `#999999` on `#ffffff` | 2.8:1 | ⚠️ Large text only |

---

## 3. 타이포그래피

### 3.1 폰트 패밀리

```css
font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', 
             'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif;
```

**선택 이유**:
- **Roboto**: 깔끔하고 현대적인 무료 폰트
- **Fallback**: 시스템 폰트로 빠른 로딩
- **한글 지원**: Apple SD Gothic Neo, Noto Sans KR

### 3.2 타입 스케일

| 레벨 | 크기 | 용도 | CSS 클래스 |
|------|------|------|-----------|
| Display | 2.5rem (40px) | 페이지 제목 | `.text-display` |
| H1 | 2rem (32px) | 섹션 제목 | `h1` |
| H2 | 1.5rem (24px) | 컬럼 제목 | `h2` |
| H3 | 1.25rem (20px) | 카드 제목 | `h3` |
| Body | 1rem (16px) | 본문 | `body` |
| Small | 0.875rem (14px) | 보조 텍스트 | `.text-small` |
| Tiny | 0.75rem (12px) | 라벨, 카운트 | `.text-tiny` |

### 3.3 폰트 웨이트

```css
--font-light: 300;       /* 가벼운 텍스트 */
--font-regular: 400;     /* 기본 텍스트 */
--font-medium: 500;      /* 강조 텍스트 */
--font-bold: 700;        /* 제목, 버튼 */
```

**사용 가이드**:
- **300 (Light)**: 부제목, 설명문
- **400 (Regular)**: 본문, 카드 내용
- **500 (Medium)**: 버튼, 라벨
- **700 (Bold)**: 페이지 제목, 컬럼 헤더

### 3.4 줄 높이 (Line Height)

```css
--line-height-tight: 1.2;    /* 제목 */
--line-height-normal: 1.5;   /* 본문 */
--line-height-relaxed: 1.75; /* 긴 문장 */
```

### 3.5 타이포그래피 예시

```css
/* 페이지 제목 */
h1 {
  font-size: 2.5rem;
  font-weight: 700;
  line-height: 1.2;
  color: var(--text-inverse);
}

/* 컬럼 제목 */
.column-header h2 {
  font-size: 1.25rem;
  font-weight: 500;
  line-height: 1.2;
  color: var(--text-primary);
}

/* 카드 제목 */
.card-title {
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.5;
  color: var(--text-primary);
}

/* 카드 개수 */
.card-count {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-inverse);
}
```

---

## 4. 간격 시스템 (Spacing)

### 4.1 기본 단위

**Base Unit**: 4px (0.25rem)

```css
--space-1: 4px;      /* 0.25rem */
--space-2: 8px;      /* 0.5rem */
--space-3: 12px;     /* 0.75rem */
--space-4: 16px;     /* 1rem */
--space-5: 20px;     /* 1.25rem */
--space-6: 24px;     /* 1.5rem */
--space-8: 32px;     /* 2rem */
--space-10: 40px;    /* 2.5rem */
--space-12: 48px;    /* 3rem */
--space-16: 64px;    /* 4rem */
--space-20: 80px;    /* 5rem */
```

### 4.2 사용 가이드

| 크기 | 용도 |
|------|------|
| 4px | 아이콘-텍스트 간격 |
| 8px | 버튼 패딩(상하) |
| 12px | 카드 간 간격 |
| 16px | 카드 내부 패딩, 버튼 패딩(좌우) |
| 20px | 컬럼 간 간격, 섹션 패딩 |
| 24px | 헤더 하단 여백 |
| 32px | 페이지 상하 여백 |

### 4.3 적용 예시

```css
.card {
  padding: var(--space-4);           /* 16px */
  margin-bottom: var(--space-3);     /* 12px */
}

.kanban-board {
  gap: var(--space-5);               /* 20px */
}

.column-header {
  padding: var(--space-4) var(--space-5);  /* 16px 20px */
}
```

---

## 5. 레이아웃

### 5.1 그리드 시스템

**컨테이너 최대 너비**:
```css
.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
}
```

**브레이크포인트**:
```css
--breakpoint-xs: 0px;         /* 모바일 세로 */
--breakpoint-sm: 480px;       /* 모바일 가로 */
--breakpoint-md: 768px;       /* 태블릿 */
--breakpoint-lg: 992px;       /* 작은 데스크톱 */
--breakpoint-xl: 1200px;      /* 데스크톱 */
--breakpoint-2xl: 1400px;     /* 큰 데스크톱 */
```

### 5.2 컬럼 레이아웃

#### 데스크톱 (> 992px)
```css
.kanban-board {
  display: flex;
  gap: 20px;
}

.kanban-column {
  flex: 1;  /* 각 컬럼 균등 분배 (33.33%) */
  min-width: 300px;
}
```

#### 태블릿 (768px - 992px)
```css
@media (max-width: 992px) {
  .kanban-board {
    flex-direction: column;
  }
  
  .kanban-column {
    width: 100%;
  }
}
```

#### 모바일 (< 768px)
```css
@media (max-width: 768px) {
  .container {
    padding: 0 10px;
  }
  
  .add-card-section {
    flex-direction: column;
  }
}
```

---

## 6. 컴포넌트

### 6.1 버튼 (Button)

#### Primary Button
```css
.btn-primary {
  padding: 12px 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-primary:active {
  transform: translateY(0);
}
```

#### Delete Button
```css
.card-delete {
  background: none;
  border: none;
  color: #999999;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  transition: all 0.2s;
}

.card-delete:hover {
  background: #fee;
  color: #e53e3e;
}
```

### 6.2 입력 필드 (Input)

```css
input[type="text"] {
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
  transition: border-color 0.2s;
}

input[type="text"]:focus {
  outline: none;
  border-color: #667eea;
}

input[type="text"]::placeholder {
  color: #999999;
}
```

### 6.3 드롭다운 (Select)

```css
select {
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
  cursor: pointer;
  transition: border-color 0.2s;
}

select:focus {
  outline: none;
  border-color: #667eea;
}
```

### 6.4 카드 (Card)

```css
.card {
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  cursor: grab;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-color: #667eea;
}

.card.dragging {
  opacity: 0.5;
  cursor: grabbing;
  transform: rotate(2deg);
}
```

### 6.5 컬럼 (Column)

```css
.kanban-column {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.column-header {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid #e0e0e0;
}

.card-count {
  background: #667eea;
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
}
```

### 6.6 드래그 피드백

```css
/* 드롭 영역 하이라이트 */
.cards-container.drag-over {
  background: rgba(102, 126, 234, 0.1);
  border: 2px dashed #667eea;
  border-radius: 8px;
  transition: background 0.2s, border 0.2s;
}

/* 빈 상태 */
.empty-state {
  color: #999;
  text-align: center;
  padding: 60px 20px;
  font-size: 0.9rem;
  border: 2px dashed #ddd;
  border-radius: 8px;
  background: #fafafa;
}
```

---

## 7. 아이콘 시스템

### 7.1 아이콘 스타일
- **스타일**: 이모지 (유니코드)
- **크기**: 텍스트 크기와 동일 (상속)
- **색상**: 컨텍스트에 따라 변경

### 7.2 사용된 아이콘

| 아이콘 | 유니코드 | 용도 |
|--------|---------|------|
| 🎯 | U+1F3AF | 페이지 제목 |
| 📝 | U+1F4DD | 할 일 컬럼 |
| ⚙️ | U+2699 | 진행중 컬럼 |
| ✅ | U+2705 | 완료 컬럼 |
| × | U+00D7 | 삭제 버튼 |

### 7.3 향후 확장 (Material Icons)

```html
<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
```

```css
.material-icons {
  font-size: inherit;
  vertical-align: middle;
}
```

---

## 8. 애니메이션 & 전환

### 8.1 전환 타이밍

```css
--transition-fast: 0.1s;       /* 버튼 피드백 */
--transition-normal: 0.2s;     /* 기본 전환 */
--transition-slow: 0.3s;       /* 부드러운 전환 */
```

### 8.2 이징 함수

```css
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-smooth: cubic-bezier(0.25, 0.1, 0.25, 1);
```

### 8.3 적용 예시

```css
/* 카드 호버 */
.card {
  transition: all 0.2s cubic-bezier(0.25, 0.1, 0.25, 1);
}

/* 버튼 클릭 */
.btn-primary {
  transition: transform 0.1s ease-out;
}

/* 드롭 영역 하이라이트 */
.cards-container {
  transition: background 0.2s ease-in-out, border 0.2s ease-in-out;
}
```

### 8.4 마이크로 인터랙션

#### 카드 Lift 효과
```css
.card:hover {
  transform: translateY(-2px);
  transition: transform 0.2s ease-out;
}
```

#### 버튼 Press 효과
```css
.btn-primary:active {
  transform: translateY(0) scale(0.98);
  transition: transform 0.1s ease-in;
}
```

#### 드래그 시작 회전
```css
.card.dragging {
  transform: rotate(2deg);
  transition: transform 0.2s ease-out;
}
```

---

## 9. 그림자 (Shadows)

### 9.1 그림자 레벨

```css
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-md: 0 2px 4px rgba(0, 0, 0, 0.08);
--shadow-lg: 0 4px 8px rgba(0, 0, 0, 0.12);
--shadow-xl: 0 4px 12px rgba(0, 0, 0, 0.15);
--shadow-2xl: 0 8px 24px rgba(0, 0, 0, 0.2);
```

### 9.2 사용 가이드

| 레벨 | 용도 |
|------|------|
| sm | 입력 필드 border |
| md | 카드 기본 상태 |
| lg | 카드 hover |
| xl | 컬럼, 버튼 hover |
| 2xl | 모달, 드롭다운 |

### 9.3 적용 예시

```css
.card {
  box-shadow: var(--shadow-md);
}

.card:hover {
  box-shadow: var(--shadow-lg);
}

.kanban-column {
  box-shadow: var(--shadow-xl);
}
```

---

## 10. 라운딩 (Border Radius)

### 10.1 라운딩 스케일

```css
--radius-sm: 4px;       /* 작은 요소 */
--radius-md: 6px;       /* 카드 내부 요소 */
--radius-lg: 8px;       /* 카드, 입력 필드 */
--radius-xl: 12px;      /* 컬럼, 버튼 */
--radius-2xl: 16px;     /* 모달 */
--radius-full: 9999px;  /* 원형 (카운트 뱃지) */
```

### 10.2 적용 예시

```css
.card {
  border-radius: var(--radius-lg);  /* 8px */
}

.kanban-column {
  border-radius: var(--radius-xl);  /* 12px */
}

.card-count {
  border-radius: var(--radius-full);  /* 완전한 원형 */
}
```

---

## 11. 반응형 디자인

### 11.1 브레이크포인트 전략

```css
/* Mobile First Approach */

/* Base: Mobile (< 768px) */
.kanban-board {
  flex-direction: column;
}

/* Tablet (≥ 768px) */
@media (min-width: 768px) {
  .kanban-board {
    flex-direction: column;  /* 여전히 세로 */
  }
}

/* Desktop (≥ 992px) */
@media (min-width: 992px) {
  .kanban-board {
    flex-direction: row;     /* 가로 배치 */
  }
}
```

### 11.2 터치 타겟 크기

**최소 크기**: 44x44px (Apple HIG, Material Design 권장)

```css
.card-delete {
  min-width: 44px;
  min-height: 44px;
  padding: 10px;
}

@media (max-width: 768px) {
  .btn-primary {
    min-height: 48px;  /* 모바일에서 더 큼 */
  }
}
```

---

## 12. 접근성 (Accessibility)

### 12.1 색상 대비

**최소 대비율**: 4.5:1 (WCAG AA)

- 본문 텍스트: `#333333` on `#ffffff` → 12.6:1 ✅
- 버튼 텍스트: `#ffffff` on `#667eea` → 4.8:1 ✅
- 힌트 텍스트: `#999999` on `#ffffff` → 2.8:1 ⚠️ (Large text only)

### 12.2 포커스 인디케이터

```css
*:focus {
  outline: 2px solid #667eea;
  outline-offset: 2px;
}

button:focus-visible,
input:focus-visible {
  outline: 2px solid #667eea;
  outline-offset: 2px;
}
```

### 12.3 키보드 내비게이션

```css
/* Tab 순서 시각화 */
*:focus-visible {
  outline: 2px dashed #667eea;
}

/* 드래그 불가능 시 대체 UI */
@media (hover: none) {
  .card {
    cursor: default;
  }
}
```

---

## 13. 다크 모드 (향후)

### 13.1 색상 변수 (CSS Variables)

```css
:root {
  --bg-primary: #ffffff;
  --text-primary: #333333;
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg-primary: #1a1a1a;
    --text-primary: #e0e0e0;
  }
}
```

---

## 14. 디자인 토큰

### 14.1 CSS 변수 전체 목록

```css
:root {
  /* Colors */
  --primary-500: #667eea;
  --secondary-500: #764ba2;
  --success: #10b981;
  --warning: #f59e0b;
  --error: #e53e3e;
  
  /* Text */
  --text-primary: #333333;
  --text-secondary: #666666;
  --text-tertiary: #999999;
  
  /* Spacing */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  
  /* Typography */
  --font-regular: 400;
  --font-medium: 500;
  --font-bold: 700;
  
  /* Shadows */
  --shadow-md: 0 2px 4px rgba(0, 0, 0, 0.08);
  --shadow-lg: 0 4px 8px rgba(0, 0, 0, 0.12);
  
  /* Border Radius */
  --radius-lg: 8px;
  --radius-xl: 12px;
  
  /* Transitions */
  --transition-normal: 0.2s;
}
```

---

## 15. 스타일 가이드 예시

### 15.1 DO ✅

```css
/* 좋은 예 */
.card {
  padding: var(--space-4);
  border-radius: var(--radius-lg);
  transition: all var(--transition-normal);
}
```

### 15.2 DON'T ❌

```css
/* 나쁜 예 */
.card {
  padding: 15px;  /* 일관성 없는 값 */
  border-radius: 7px;  /* 시스템 외 값 */
  transition: 0.25s;  /* 변수 미사용 */
}
```

---

## 16. 디자인 체크리스트

- [ ] 모든 색상이 팔레트 내에 있는가?
- [ ] 버튼 크기가 최소 44x44px인가?
- [ ] 텍스트 대비율이 4.5:1 이상인가?
- [ ] 모든 인터랙티브 요소에 호버/포커스 상태가 있는가?
- [ ] 반응형 디자인이 3개 브레이크포인트를 지원하는가?
- [ ] 전환 애니메이션이 0.2s 이하인가?
- [ ] 그림자가 일관된 레벨을 사용하는가?

---

## 17. 문서 정보

- **작성일**: 2026-06-18
- **작성자**: Dohyun Um
- **버전**: 1.0
- **최종 수정일**: 2026-06-18
- **디자인 도구**: Figma (선택 사항)

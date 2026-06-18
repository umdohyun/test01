# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Kanban Board** application built with vanilla HTML, CSS, and JavaScript. No external libraries or frameworks are used. The application uses HTML5 Drag and Drop API for card movement and localStorage for data persistence.

### Core Features
- **Authentication**: Email/password signup and GitHub OAuth via Supabase
- Three fixed columns: 할 일 (To-do), 진행중 (In-progress), 완료 (Done)
- Drag-and-drop cards between columns
- Create and delete cards
- Persistent storage using localStorage
- Responsive design (desktop/tablet/mobile)

## Architecture

### File Structure
```
kanban/
├── index.html         # Main kanban board (requires authentication)
├── login.html         # Login page (email/password + GitHub OAuth)
├── signup.html        # Signup page
├── style.css          # All styles (layout, drag states, responsive, auth)
├── script.js          # Kanban board logic (state, CRUD, drag handlers)
├── auth.js            # Supabase authentication module
├── config.js          # Supabase credentials (gitignored)
├── config.example.js  # Supabase config template
├── .gitignore         # Git ignore file
├── SUPABASE.md        # Supabase setup guide
└── docs/              # Design documentation
    ├── PLAN.md
    ├── PRD.md
    ├── TRD.md
    ├── USER_FLOW.md
    ├── DATABASE_DESIGN.md
    ├── DESIGN_SYSTEM.md
    └── TASKS.md
```

### Data Model
Cards are stored as objects in a global array:
```javascript
{
  id: String,           // Timestamp-based unique ID
  title: String,        // Card title (1-100 chars)
  status: String,       // 'todo' | 'in-progress' | 'done'
  createdAt: String     // ISO 8601 timestamp
}
```

### State Management
- **Authentication**: Supabase session stored in localStorage (`sb-<project>-auth-token`)
- **Global state**: `cards` array (in-memory), `draggedCard` (current drag target), `currentUser` (authenticated user)
- **Persistence**: localStorage key `kanbanCards` (JSON serialized)
- **Flow**: User Action → Update State → Save to localStorage → Re-render

### HTML5 Drag and Drop Flow
Critical event chain for drag-and-drop:
1. `dragstart` → Store dragged card reference, add `.dragging` class
2. `dragover` → **MUST call `e.preventDefault()`** to allow drop
3. `dragenter` → Add `.drag-over` class to drop zone
4. `drop` → Extract new status from `data-status`, call `updateCardStatus()`, re-render
5. `dragend` → Clean up all classes

**Important**: Drag events are attached to `.cards-container`, not individual cards.

### Key Functions

**script.js** (Kanban Board):
- `loadCards()` / `saveCards()` - localStorage interface
- `renderBoard()` - Full re-render of all three columns
- `addCard(title, status)` - Create new card
- `deleteCard(id)` - Remove card with confirmation
- `updateCardStatus(id, newStatus)` - Change card status (used by drag-drop)
- `handleDragStart/Over/Drop/End()` - Drag event handlers

**auth.js** (Authentication):
- `signup(email, password)` - Email/password signup
- `login(email, password)` - Email/password login
- `loginWithGithub()` - GitHub OAuth login
- `logout()` - Logout and clear session
- `getSession()` / `getCurrentUser()` - Session management
- `checkAuth()` - Check if user is authenticated
- `getUserDisplayName(user)` - Get user display name

## Setup and Running

### 1. Supabase Setup (Required)

**IMPORTANT**: Authentication requires Supabase configuration.

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Get your Project URL and anon key from Settings > API
3. Copy `config.example.js` to `config.js`:
   ```bash
   cp config.example.js config.js
   ```
4. Edit `config.js` with your credentials:
   ```javascript
   const SUPABASE_CONFIG = {
       url: 'https://xxxxx.supabase.co',
       anonKey: 'your-anon-key-here'
   };
   ```
5. Enable Email and GitHub providers in Supabase Dashboard > Authentication > Providers

See `SUPABASE.md` for detailed setup instructions, including GitHub OAuth configuration.

### 2. Local Development
```bash
# HTTP server (required for OAuth redirect)
cd /path/to/kanban
python3 -m http.server 8000
# Visit http://localhost:8000
```

⚠️ **Note**: Simple file open (file://) won't work due to Supabase CORS and OAuth requirements.

### Testing
No automated tests. Manual testing checklist in `docs/PLAN.md`:
- Drag cards between all column combinations
- Add cards to each column
- Delete cards from each column
- Refresh page to verify persistence
- Test on different screen sizes (1920px, 768px, 375px)

### Debugging
```javascript
// Check localStorage data
console.log(JSON.parse(localStorage.getItem('kanbanCards')));

// Clear localStorage
localStorage.removeItem('kanbanCards');
location.reload();
```

## Design System

See `docs/DESIGN_SYSTEM.md` for full details.

**Key colors**:
- Primary: `#667eea` (buttons, highlights)
- Secondary: `#764ba2` (gradient)
- Background gradient: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`

**Spacing**: 4px base unit (use multiples: 4, 8, 12, 16, 20, 24, 32)

**Typography**: Roboto font family, sizes: 2.5rem (title), 1.25rem (column headers), 1rem (body)

**Responsive breakpoints**: 
- Desktop: >992px (3 columns horizontal)
- Tablet: 768-992px (3 columns vertical)
- Mobile: <768px (full width vertical)

## Code Conventions

### CSS
- Use Flexbox for layout (no Grid)
- All transitions: `0.2s ease` or similar
- Drag states: `.dragging` (on card), `.drag-over` (on container)
- Mobile-first responsive design

### JavaScript
- Vanilla ES6+ (no frameworks)
- Global state pattern (no modules/classes)
- All functions use `function` keyword (not arrow functions at top level)
- XSS prevention: Use `escapeHtml()` for all user input in innerHTML

### HTML
- Semantic HTML5 tags
- `data-*` attributes for status (`data-status`, `data-id`)
- `draggable="true"` on cards
- Korean language UI

## Important Constraints

### Technical Limitations
1. **No external libraries** - Pure vanilla JavaScript only
2. **No backend** - Client-side only, localStorage for persistence
3. **localStorage limit** - 5MB maximum
4. **Mobile touch** - HTML5 Drag API has limited mobile support (desktop-optimized)

### Git Rules
- **ALWAYS use `git merge`** - NEVER use `git rebase`
- **Do NOT read parent directories** - Work only within this kanban folder

### Security
- Always escape HTML in user input: `escapeHtml(card.title)`
- localStorage is domain-isolated (no cross-site access)

## Future Backend Integration

See `docs/DATABASE_DESIGN.md` for PostgreSQL/MySQL schema when adding backend:
- Users table (authentication)
- Boards table (multiple boards per user)
- Columns table (customizable columns)
- Cards table (maps to current localStorage card structure)

Migration path: localStorage `status` enum → `column_id` foreign key

## Documentation

Full design docs in `/docs`:
- **PRD.md** - Product requirements, user stories, success metrics
- **TRD.md** - Technical requirements, API design, SQL schemas
- **USER_FLOW.md** - User interaction flows, state diagrams
- **DATABASE_DESIGN.md** - RDB schema for future backend
- **DESIGN_SYSTEM.md** - Colors, typography, spacing, components
- **TASKS.md** - Implementation checklist

Refer to these docs before making architectural changes.

## Workflow Documentation

### WORKFLOW.md Update Rule

**IMPORTANT**: All development work must be documented in `WORKFLOW.md`.

**When to update**:
- After completing any user request or task
- Before committing code to git
- When adding new features, fixing bugs, or making significant changes

**Format**:
```markdown
### [번호]. [작업 제목]

**프롬프트:**
```
[사용자의 원본 프롬프트를 그대로 복사]
```

**작업 요약:**
- [작업 내역을 bullet point로 요약]
- [주요 변경사항 나열]
- [생성/수정된 파일 명시]

**결과:** [작업 완료 후 최종 상태 요약]
```

**Example**:
```markdown
### 12. 카드 편집 기능 추가

**프롬프트:**
```
카드를 더블클릭하면 제목을 수정할 수 있게 해줘
```

**작업 요약:**
- `script.js`: `editCard(id, newTitle)` 함수 추가
- `index.html`: 카드 더블클릭 이벤트 리스너
- `style.css`: 편집 모드 스타일 (`.card-editing`)

**결과:** ✅ 카드 더블클릭으로 제목 편집 가능
```

**Guidelines**:
- 프롬프트는 한글/영어 그대로 유지 (번역하지 않음)
- 작업 요약은 간결하게 (5-10 bullet points)
- 파일 변경은 파일명과 핵심 내용만 명시
- 결과는 한 줄로 요약
- 각 세션은 날짜로 구분 (## YYYY-MM-DD 개발 세션)

**Commit 전 체크리스트**:
1. ✅ 작업 내용이 WORKFLOW.md에 기록되었는가?
2. ✅ 프롬프트가 원문 그대로 있는가?
3. ✅ 작업 결과가 명확한가?

**File location**: `/home/ubuntu/work/kosa-vibecoding-2026-3rd/src/exercise/umdohy/day03/kanban/WORKFLOW.md`

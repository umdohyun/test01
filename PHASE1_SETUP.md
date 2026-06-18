# Phase 1: 데이터베이스 기초 구현 가이드

## 📋 개요

localStorage에서 Supabase PostgreSQL Database로 마이그레이션하여 데이터를 클라우드에 저장합니다.

### 완료 항목
- ✅ SQL 스키마 작성 (`migration.sql`)
- ✅ JavaScript API 레이어 작성 (`boardApi.js`)
- ✅ 기존 코드 수정 (`script.js`, `index.html`)
- ✅ localStorage → Supabase 자동 마이그레이션 기능

---

## 🚀 설치 및 실행 방법

### Step 1: Supabase 데이터베이스 테이블 생성

1. **Supabase Dashboard 접속**
   - https://supabase.com 로그인
   - 기존 프로젝트 선택 (URL: `https://fzjqgbidzniaeqxdfzci.supabase.co`)

2. **SQL Editor 열기**
   - 왼쪽 메뉴: `SQL Editor` 클릭
   - `New query` 버튼 클릭

3. **마이그레이션 SQL 실행**
   ```bash
   # migration.sql 파일 내용을 복사하여 SQL Editor에 붙여넣기
   ```
   
   - 전체 선택 (Ctrl+A)
   - 복사 (Ctrl+C)
   - Supabase SQL Editor에 붙여넣기 (Ctrl+V)
   - `Run` 버튼 클릭 (또는 Ctrl+Enter)

4. **테이블 생성 확인**
   - 왼쪽 메뉴: `Table Editor` 클릭
   - 다음 테이블이 생성되었는지 확인:
     - ✅ `boards` (보드 정보)
     - ✅ `cards` (카드 데이터)
     - ✅ `board_members` (보드 공유 - Phase 3에서 사용)

5. **RLS 정책 확인**
   - 왼쪽 메뉴: `Authentication` > `Policies` 클릭
   - `boards`, `cards` 테이블에 정책이 활성화되었는지 확인

---

### Step 2: 로컬 테스트

1. **HTTP 서버 실행**
   ```bash
   cd /home/ubuntu/work/kosa-vibecoding-2026-3rd/src/exercise/umdohy/day03/kanban
   python3 -m http.server 8000
   ```

2. **브라우저에서 접속**
   ```
   http://localhost:8000
   ```

3. **로그인**
   - 기존 계정으로 로그인 (이메일 또는 GitHub)

4. **자동 마이그레이션 확인**
   - localStorage에 기존 카드가 있으면 자동으로 Supabase로 이전됨
   - 브라우저 콘솔(F12)에서 확인:
     ```
     ✅ 4개의 카드를 localStorage에서 Supabase로 마이그레이션했습니다.
     ```

5. **기능 테스트**
   - ✅ 카드 추가
   - ✅ 카드 드래그 앤 드롭
   - ✅ 카드 삭제
   - ✅ 페이지 새로고침 후 데이터 유지

---

## 📁 파일 구조

### 신규 파일
```
kanban/
├── migration.sql          # Supabase 테이블 생성 SQL
├── boardApi.js           # Supabase API 레이어
└── PHASE1_SETUP.md       # 이 문서
```

### 수정된 파일
```
kanban/
├── index.html            # boardApi.js 스크립트 추가
└── script.js             # localStorage → Supabase API 전환
```

---

## 🔍 주요 변경사항

### 1. 데이터 저장 방식 변경

**Before (localStorage):**
```javascript
localStorage.setItem('kanbanCards', JSON.stringify(cards));
```

**After (Supabase):**
```javascript
const result = await createCard(boardId, title, status);
```

### 2. 데이터 로딩 방식 변경

**Before (localStorage):**
```javascript
function loadCards() {
    const saved = localStorage.getItem('kanbanCards');
    cards = saved ? JSON.parse(saved) : getInitialCards();
}
```

**After (Supabase):**
```javascript
async function loadCards() {
    const result = await fetchCards(currentBoard.id);
    cards = result.success ? result.cards : [];
}
```

### 3. 보드 개념 추가

- 사용자당 기본 보드 1개 자동 생성
- `currentBoard` 전역 변수로 현재 활성 보드 추적
- 향후 여러 보드 지원 가능

---

## 🛠️ 주요 함수 (boardApi.js)

### `getOrCreateDefaultBoard()`
- 현재 사용자의 기본 보드 가져오기
- 없으면 "내 칸반보드" 자동 생성

### `fetchCards(boardId)`
- 보드의 모든 카드 조회
- status와 position 순으로 정렬

### `createCard(boardId, title, status)`
- 새 카드 생성
- position 자동 계산

### `updateCardStatus(cardId, newStatus)`
- 카드 상태 변경 (드래그 앤 드롭)
- 새 컬럼의 마지막 위치로 이동

### `deleteCard(cardId)`
- 카드 삭제

### `migrateFromLocalStorage(boardId)`
- localStorage → Supabase 일회성 마이그레이션
- 이미 Supabase에 카드가 있으면 건너뜀
- 완료 후 localStorage 백업 및 제거

---

## 🔒 보안 (RLS - Row Level Security)

Supabase의 RLS 정책으로 자동 보안 처리:

1. **사용자는 본인의 보드만 접근 가능**
   ```sql
   CREATE POLICY "Users can view own boards"
       ON boards FOR SELECT
       USING (auth.uid() = user_id);
   ```

2. **사용자는 본인 보드의 카드만 CRUD 가능**
   ```sql
   CREATE POLICY "Users can view cards in own boards"
       ON cards FOR SELECT
       USING (
           EXISTS (
               SELECT 1 FROM boards
               WHERE boards.id = cards.board_id
               AND boards.user_id = auth.uid()
           )
       );
   ```

- 백엔드 API 없이도 안전한 데이터 접근
- SQL Injection 자동 방어
- JWT 토큰 기반 인증

---

## 🐛 트러블슈팅

### 1. "보드를 불러올 수 없습니다" 오류

**원인:** 테이블이 생성되지 않음

**해결:**
1. Supabase Dashboard > Table Editor에서 테이블 확인
2. 없으면 `migration.sql` 재실행

---

### 2. "카드를 불러올 수 없습니다" 오류

**원인:** RLS 정책 미적용

**해결:**
1. Supabase Dashboard > Authentication > Policies
2. `boards`, `cards` 테이블에 정책 확인
3. 없으면 `migration.sql`의 RLS 섹션 재실행

---

### 3. "Supabase가 초기화되지 않았습니다" 오류

**원인:** `config.js` 설정 문제

**해결:**
1. `config.js` 파일 존재 확인
2. URL과 anon key가 올바른지 확인
3. 브라우저 콘솔(F12)에서 확인:
   ```javascript
   console.log(SUPABASE_CONFIG);
   ```

---

### 4. 마이그레이션이 실행되지 않음

**원인:** localStorage에 데이터가 없거나 이미 마이그레이션됨

**해결:**
1. 브라우저 콘솔(F12) 확인:
   ```javascript
   localStorage.getItem('kanbanCards');
   ```
2. 이미 마이그레이션된 경우 `kanbanCards_backup` 키에 백업됨
3. 수동 재마이그레이션:
   ```javascript
   // 콘솔에서 실행
   localStorage.setItem('kanbanCards', localStorage.getItem('kanbanCards_backup'));
   location.reload();
   ```

---

### 5. 카드가 중복으로 생성됨

**원인:** 여러 번 클릭 또는 네트워크 지연

**해결:**
1. Supabase Dashboard > Table Editor > `cards` 테이블
2. 중복 카드 수동 삭제
3. 코드 수정 (debouncing 추가 - Phase 2에서 개선)

---

## 📊 데이터 구조

### boards 테이블
```sql
id            UUID        (Primary Key)
user_id       UUID        (Foreign Key → auth.users)
title         VARCHAR(200)
description   TEXT
is_archived   BOOLEAN
created_at    TIMESTAMP
updated_at    TIMESTAMP
```

### cards 테이블
```sql
id            UUID        (Primary Key)
board_id      UUID        (Foreign Key → boards)
title         VARCHAR(200)
description   TEXT
status        VARCHAR(20) ('todo' | 'in-progress' | 'done')
position      INTEGER
created_at    TIMESTAMP
updated_at    TIMESTAMP
```

### board_members 테이블 (Phase 3에서 사용)
```sql
id            UUID        (Primary Key)
board_id      UUID        (Foreign Key → boards)
user_id       UUID        (Foreign Key → auth.users)
role          VARCHAR(20) ('owner' | 'editor' | 'viewer')
invited_at    TIMESTAMP
```

---

## ✅ Phase 1 완료 체크리스트

### 데이터베이스
- [ ] Supabase에 테이블 생성 완료
- [ ] RLS 정책 활성화 확인
- [ ] 테스트 카드 수동 추가/조회 성공

### 프론트엔드
- [ ] `boardApi.js` 로드 확인 (브라우저 콘솔 에러 없음)
- [ ] 로그인 후 기본 보드 자동 생성 확인
- [ ] localStorage → Supabase 마이그레이션 성공

### 기능 테스트
- [ ] 카드 추가 작동
- [ ] 카드 드래그 앤 드롭 작동
- [ ] 카드 삭제 작동
- [ ] 페이지 새로고침 후 데이터 유지

### 브라우저 콘솔 확인
- [ ] "✅ 보드 로드: 내 칸반보드" 메시지
- [ ] "✅ N개의 카드를 불러왔습니다" 메시지
- [ ] 에러 메시지 없음

---

## 🎯 다음 단계: Phase 2

Phase 1이 완료되면 Phase 2로 진행합니다:

### Phase 2: 실시간 동기화 (1-2시간)
- Supabase Realtime 구독 설정
- 다른 사용자의 변경사항 자동 반영
- 낙관적 UI 업데이트 (Optimistic Update)

**시작 조건:**
- Phase 1의 모든 체크리스트 완료
- 카드 CRUD가 정상 작동

---

## 📝 참고 자료

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

**작성일**: 2026-06-18  
**버전**: Phase 1 초안

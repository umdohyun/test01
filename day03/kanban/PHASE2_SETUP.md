# Phase 2: 실시간 동기화 구현 가이드

## 📋 개요

Supabase Realtime을 사용하여 여러 브라우저/사용자가 동시에 작업할 때 변경사항이 즉시 반영되도록 구현합니다.

### 완료 항목
- ✅ Realtime 구독 레이어 작성 (`realtime.js`)
- ✅ 카드 변경 이벤트 핸들러 (`script.js` 수정)
- ✅ 실시간 알림 UI (토스트 알림)
- ✅ Realtime 활성화 SQL (`realtime_setup.sql`)

---

## 🚀 설치 및 실행 방법

### Step 1: Supabase Realtime 활성화

1. **Supabase Dashboard 접속**
   - https://supabase.com 로그인
   - 프로젝트 선택

2. **SQL Editor 열기**
   - 왼쪽 메뉴 > `SQL Editor` 클릭

3. **Realtime 활성화 SQL 실행**
   ```bash
   cat realtime_setup.sql
   ```
   - 파일 내용 전체 복사
   - Supabase SQL Editor에 붙여넣기
   - `Run` 버튼 클릭

4. **Realtime 상태 확인**
   - SQL 실행 결과에서 `relreplident` 컬럼 확인
   - `f` (full)이면 정상 ✅

---

### Step 2: 브라우저에서 테스트

1. **페이지 새로고침**
   ```
   http://localhost:8000
   F5 키 누르기
   ```

2. **콘솔 확인 (F12)**
   ```
   🔄 Realtime 구독 시작: <board-id>
   🔄 Realtime 상태: SUBSCRIBED
   ✅ Realtime 구독 완료
   ```

3. **시크릿 창 열기**
   - Ctrl+Shift+N (Chrome) 또는 Ctrl+Shift+P (Firefox)
   - 같은 URL 접속: http://localhost:8000
   - 같은 계정으로 로그인

4. **실시간 동기화 테스트**
   
   **브라우저 A (원본 창)**:
   - 카드 추가: "테스트 카드"
   
   **브라우저 B (시크릿 창)**:
   - 📡 즉시 알림 표시: "새 카드가 추가되었습니다: 테스트 카드"
   - 카드가 자동으로 화면에 나타남

5. **드래그 앤 드롭 테스트**
   
   **브라우저 A**:
   - 카드를 To-do → In-progress로 드래그
   
   **브라우저 B**:
   - 📡 알림: "카드가 이동되었습니다: 테스트 카드"
   - 카드가 자동으로 In-progress 컬럼으로 이동

6. **삭제 테스트**
   
   **브라우저 A**:
   - 카드 삭제 버튼 (×) 클릭
   
   **브라우저 B**:
   - 📡 알림: "카드가 삭제되었습니다: 테스트 카드"
   - 카드가 자동으로 화면에서 사라짐

---

## 📁 파일 구조

### 신규 파일
```
kanban/
├── realtime.js           # Supabase Realtime 구독 레이어
├── realtime_setup.sql    # Realtime 활성화 SQL
└── PHASE2_SETUP.md       # 이 문서
```

### 수정된 파일
```
kanban/
├── index.html            # realtime.js 스크립트 추가
├── script.js             # Realtime 이벤트 핸들러 추가
└── style.css             # 토스트 알림 스타일 추가
```

---

## 🔍 주요 기능

### 1. 실시간 이벤트 수신

**Realtime 구독**:
```javascript
subscribeToBoard(boardId, handleRealtimeCardChange);
```

**이벤트 종류**:
- `INSERT`: 새 카드 추가
- `UPDATE`: 카드 상태 변경 (드래그 앤 드롭)
- `DELETE`: 카드 삭제

### 2. 중복 방지

동일한 카드가 여러 번 추가되지 않도록 ID 체크:
```javascript
if (!cards.find(c => c.id === card.id)) {
    cards.push(card);
}
```

### 3. 토스트 알림

우측 상단에 3초간 알림 표시:
- 새 카드 추가됨
- 카드 이동됨
- 카드 삭제됨

### 4. 자동 재연결

네트워크 끊김 시 자동 재연결 시도:
```javascript
reconnectRealtime(boardId, onCardChange);
```

---

## 🎨 UI 변경사항

### 토스트 알림 스타일

```css
.realtime-notification {
    position: fixed;
    top: 80px;
    right: 20px;
    background: linear-gradient(135deg, #00bcd4 0%, #26c6da 100%);
    /* ... */
}
```

**애니메이션**:
- `slideIn`: 우측에서 슬라이드 인
- `fadeOut`: 페이드 아웃

---

## 🛠️ 주요 함수 (realtime.js)

### `subscribeToBoard(boardId, onCardChange)`
- Realtime 채널 생성 및 구독
- `postgres_changes` 이벤트 리스닝
- cards 테이블의 INSERT/UPDATE/DELETE 감지

### `handleRealtimeEvent(payload, onCardChange)`
- Realtime 이벤트 파싱
- eventType에 따라 콜백 호출

### `unsubscribeFromBoard()`
- Realtime 구독 해제
- 페이지 언로드 시 자동 호출

### `formatCard(record)`
- Supabase 레코드 → 앱 포맷 변환

---

## 🔐 보안

### RLS (Row Level Security)

Realtime도 RLS 정책을 따릅니다:
- 사용자는 본인의 보드 카드만 수신
- 다른 사용자의 변경사항은 수신 안됨

**확인 방법**:
1. 브라우저 A: 계정1 로그인
2. 브라우저 B: 계정2 로그인
3. 브라우저 A에서 카드 추가
4. 브라우저 B에는 알림 없음 (다른 사용자의 보드)

---

## 🐛 트러블슈팅

### 1. "Realtime 구독 완료" 메시지가 안 보임

**원인**: Realtime이 활성화되지 않음

**해결**:
1. `realtime_setup.sql` 재실행
2. 브라우저 콘솔 확인:
   ```javascript
   // 에러 메시지 확인
   ❌ Realtime 구독 오류
   ```

---

### 2. 카드가 중복으로 나타남

**원인**: 자기 자신의 변경사항도 Realtime 이벤트로 수신

**현재 상태**: 
- 중복 방지 로직 구현됨
- ID 체크로 이미 있는 카드는 추가 안됨

**추가 개선** (선택):
- 낙관적 UI 업데이트 (Optimistic Update)
- 자기 변경사항은 Realtime 무시

---

### 3. 알림이 너무 많이 뜸

**원인**: 여러 브라우저에서 동시 작업

**정상 동작**: 
- 다른 창의 변경사항만 알림 표시
- 자기 변경사항은 알림 없음 (이미 화면에 표시)

---

### 4. 네트워크 끊김 후 동기화 안됨

**원인**: Realtime 연결 끊김

**해결**:
- 페이지 새로고침 (F5)
- 자동 재연결 기능 추가 예정

---

## 📊 Realtime 이벤트 구조

### INSERT 이벤트
```javascript
{
    eventType: 'INSERT',
    new: {
        id: 'uuid',
        board_id: 'uuid',
        title: '새 카드',
        status: 'todo',
        position: 0,
        created_at: '2026-06-18T...'
    },
    old: null
}
```

### UPDATE 이벤트
```javascript
{
    eventType: 'UPDATE',
    new: {
        id: 'uuid',
        status: 'in-progress',  // 변경됨
        // ... 나머지 필드
    },
    old: {
        id: 'uuid',
        status: 'todo',  // 이전 값
        // ... 나머지 필드
    }
}
```

### DELETE 이벤트
```javascript
{
    eventType: 'DELETE',
    new: null,
    old: {
        id: 'uuid',
        title: '삭제된 카드',
        // ... 나머지 필드
    }
}
```

---

## ✅ Phase 2 완료 체크리스트

### Supabase 설정
- [ ] `realtime_setup.sql` 실행 완료
- [ ] `relreplident = 'f'` 확인

### 프론트엔드
- [ ] `realtime.js` 로드 확인
- [ ] "✅ Realtime 구독 완료" 메시지 확인
- [ ] 에러 없음

### 실시간 동기화 테스트
- [ ] 두 개의 브라우저 창 열기
- [ ] 카드 추가 → 다른 창에 즉시 표시
- [ ] 카드 이동 → 다른 창에 즉시 반영
- [ ] 카드 삭제 → 다른 창에서 즉시 사라짐
- [ ] 토스트 알림 표시 확인

### 성능
- [ ] 네트워크 탭에서 Realtime WebSocket 연결 확인
- [ ] CPU 사용률 정상 (과도한 리렌더링 없음)
- [ ] 메모리 누수 없음

---

## 🎯 다음 단계: Phase 3

Phase 2가 완료되면 Phase 3로 진행합니다:

### Phase 3: 보드 공유 (1시간)
- 보드 멤버 초대 UI
- 이메일/링크로 초대
- 역할 관리 (owner, editor, viewer)
- RLS 정책 확장 (공유 보드 접근)

**시작 조건**:
- Phase 2의 모든 체크리스트 완료
- 실시간 동기화가 안정적으로 작동

---

## 🌟 Phase 2의 가치

### Before Phase 2
- 😞 페이지 새로고침해야 변경사항 확인
- 😞 다른 사용자와 동시 작업 불가
- 😞 충돌 위험 (같은 카드 수정)

### After Phase 2
- 🎉 변경사항 즉시 반영 (새로고침 불필요)
- 🎉 여러 사용자 동시 작업 가능
- 🎉 실시간 알림으로 협업 인식 향상

---

## 📝 참고 자료

- [Supabase Realtime Documentation](https://supabase.com/docs/guides/realtime)
- [Postgres Logical Replication](https://www.postgresql.org/docs/current/logical-replication.html)
- [WebSocket Protocol](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)

---

**작성일**: 2026-06-18  
**버전**: Phase 2 초안

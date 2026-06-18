# 칸반보드 - 작업 목록
## Tasks Document

---

## 프로젝트 상태

**버전**: v1.1 (Authentication)  
**완료일**: 2026-06-18  
**상태**: ✅ 완료

---

## 1. 완료된 작업 (Completed)

### Phase 1: 기본 구조 ✅
- [x] HTML 파일 생성 (`index.html`)
  - [x] 3개 컬럼 구조 (todo, in-progress, done)
  - [x] 카드 추가 섹션 (입력창 + 드롭다운 + 버튼)
  - [x] 컬럼 헤더 (제목 + 카드 개수 표시)
  - [x] 빈 상태 플레이스홀더

### Phase 2: 스타일링 ✅
- [x] CSS 파일 생성 (`style.css`)
  - [x] 그라데이션 배경 적용
  - [x] Flexbox 3컬럼 레이아웃
  - [x] 카드 스타일 (hover, shadow)
  - [x] 드래그 상태 스타일 (`.dragging`, `.drag-over`)
  - [x] 반응형 디자인 (992px, 768px 브레이크포인트)
  - [x] Google Fonts (Roboto) 임포트

### Phase 3: JavaScript 기능 ✅
- [x] JavaScript 파일 생성 (`script.js`)
  - [x] 전역 상태 관리 (`cards`, `draggedCard`)
  - [x] localStorage 인터페이스 (`loadCards`, `saveCards`)
  - [x] 렌더링 함수 (`renderBoard`, `createCardElement`)
  - [x] CRUD 함수 (`addCard`, `deleteCard`, `updateCardStatus`)
  - [x] 드래그 이벤트 핸들러 (6개 함수)
  - [x] 초기 데모 데이터 (4개 샘플 카드)
  - [x] XSS 방지 (`escapeHtml` 함수)
  - [x] 에러 처리 (try-catch for localStorage)

### Phase 4: 상호작용 ✅
- [x] 카드 추가 기능
  - [x] 버튼 클릭으로 추가
  - [x] Enter 키로 추가
  - [x] 빈 입력 검증
  - [x] 입력 필드 자동 초기화
- [x] 카드 삭제 기능
  - [x] 삭제 버튼 (× 아이콘)
  - [x] 확인 다이얼로그
- [x] 드래그 앤 드롭
  - [x] 카드 드래그 시작 (dragstart)
  - [x] 드롭 영역 하이라이트 (dragenter/leave)
  - [x] 카드 드롭 (drop)
  - [x] 상태 업데이트 및 저장
  - [x] 드래그 종료 정리 (dragend)

### Phase 5: 데이터 영속성 ✅
- [x] localStorage 저장
  - [x] 카드 추가 시 자동 저장
  - [x] 카드 삭제 시 자동 저장
  - [x] 카드 이동 시 자동 저장
- [x] localStorage 로드
  - [x] 페이지 로드 시 자동 복원
  - [x] 최초 방문 시 샘플 데이터 제공
  - [x] JSON 파싱 에러 처리

### Phase 6: UI/UX 개선 ✅
- [x] 시각적 피드백
  - [x] 카드 hover 효과 (transform, shadow)
  - [x] 드래그 중 opacity 감소
  - [x] 드롭 영역 배경 하이라이트
  - [x] 버튼 press 효과
- [x] 카드 개수 표시
  - [x] 각 컬럼 헤더에 배지
  - [x] 실시간 업데이트
- [x] 빈 상태 처리
  - [x] 플레이스홀더 메시지
  - [x] 점선 테두리

### Phase 7: 문서화 ✅
- [x] 설계 문서 작성
  - [x] `docs/PLAN.md` - 구현 계획
  - [x] `docs/PRD.md` - 제품 요구사항 정의서
  - [x] `docs/TRD.md` - 기술 요구사항 정의서
  - [x] `docs/USER_FLOW.md` - 사용자 플로우
  - [x] `docs/DATABASE_DESIGN.md` - 데이터베이스 설계
  - [x] `docs/DESIGN_SYSTEM.md` - 디자인 시스템
  - [x] `docs/TASKS.md` - 작업 목록 (이 문서)
- [x] 개발자 가이드
  - [x] `CLAUDE.md` - Claude Code 작업 가이드

### Phase 8: 사용자 인증 ✅ (v1.1)
- [x] Supabase 설정
  - [x] `.gitignore` 생성 (config.js 제외)
  - [x] `config.example.js` 템플릿 생성
  - [x] `SUPABASE.md` 설정 가이드 작성
- [x] 인증 UI
  - [x] `login.html` - 로그인 페이지
  - [x] `signup.html` - 회원가입 페이지
  - [x] 이메일/비밀번호 폼
  - [x] GitHub OAuth 버튼
- [x] 인증 로직
  - [x] `auth.js` - Supabase 인증 모듈
  - [x] 회원가입 함수
  - [x] 로그인 함수
  - [x] GitHub OAuth 함수
  - [x] 로그아웃 함수
  - [x] 세션 관리 함수
- [x] 칸반보드 통합
  - [x] `index.html` - 사용자 정보 헤더 추가
  - [x] `script.js` - 인증 체크 및 리디렉션
  - [x] `style.css` - 헤더 스타일 업데이트
- [x] 문서 업데이트
  - [x] `CLAUDE.md` - 인증 관련 내용 추가
  - [x] `docs/PRD.md` - 기능 목록 업데이트
  - [x] `docs/TASKS.md` - 작업 내역 추가

---

## 2. 알려진 이슈 (Known Issues)

### 이슈 없음 🎉
현재 버전(v1.0)에는 중대한 이슈가 없습니다.

### 제약사항 (Limitations)
1. **모바일 터치 제한**: HTML5 Drag API는 터치 디바이스에서 제한적으로 작동 (데스크톱 최적화)
2. **동시 편집 미지원**: 여러 브라우저 탭에서 동시 편집 시 localStorage 동기화 안 됨
3. **카드 정렬 기능 없음**: 같은 컬럼 내 카드 순서 변경 불가능 (추가된 순서대로 표시)

---

## 3. 향후 개선 사항 (Future Enhancements)

### v1.1 (Enhancement) - 예정
- [ ] **카드 편집 기능**
  - [ ] 카드 제목 인라인 편집 (더블 클릭)
  - [ ] 카드 설명 필드 추가
  - [ ] 수정 시각 기록 (`updatedAt`)

- [ ] **우선순위 시스템**
  - [ ] 우선순위 필드 추가 (낮음/보통/높음/긴급)
  - [ ] 우선순위별 색상 표시
  - [ ] 우선순위 아이콘

- [ ] **검색 및 필터**
  - [ ] 카드 제목 검색
  - [ ] 상태별 필터링
  - [ ] 검색 결과 하이라이트

- [ ] **카드 정렬**
  - [ ] 같은 컬럼 내 드래그로 순서 변경
  - [ ] `position` 필드 추가
  - [ ] 정렬 알고리즘 구현

- [ ] **데이터 내보내기/가져오기**
  - [ ] JSON 파일 내보내기
  - [ ] JSON 파일 가져오기
  - [ ] CSV 내보내기

### v1.2 (Customization) - 예정
- [ ] **컬럼 커스터마이징**
  - [ ] 컬럼 추가/삭제
  - [ ] 컬럼 이름 변경
  - [ ] 컬럼 색상 변경
  - [ ] 컬럼 순서 변경

- [ ] **테마 시스템**
  - [ ] 라이트/다크 모드
  - [ ] 사용자 정의 색상 팔레트
  - [ ] `prefers-color-scheme` 지원

- [ ] **라벨 시스템**
  - [ ] 라벨 생성/삭제
  - [ ] 카드에 라벨 추가
  - [ ] 라벨별 필터링

### v2.0 (Backend Integration) - 장기 목표
- [ ] **백엔드 서버 구축**
  - [ ] Node.js + Express API
  - [ ] PostgreSQL 또는 MySQL 데이터베이스
  - [ ] RESTful API 엔드포인트

- [ ] **사용자 인증**
  - [ ] 회원가입/로그인 (이메일 + 비밀번호)
  - [ ] JWT 토큰 인증
  - [ ] 소셜 로그인 (Google, GitHub)

- [ ] **데이터 마이그레이션**
  - [ ] localStorage → DB 마이그레이션 도구
  - [ ] 데이터 백업 기능

- [ ] **다중 보드 관리**
  - [ ] 보드 생성/삭제
  - [ ] 보드 간 전환
  - [ ] 보드 아카이빙

### v2.1 (Collaboration) - 장기 목표
- [ ] **실시간 협업**
  - [ ] WebSocket 연결
  - [ ] 실시간 카드 이동 동기화
  - [ ] 다중 사용자 커서 표시

- [ ] **댓글 시스템**
  - [ ] 카드 댓글 추가/삭제
  - [ ] 댓글 알림
  - [ ] 멘션 기능 (@사용자)

- [ ] **팀 관리**
  - [ ] 팀원 초대
  - [ ] 권한 관리 (읽기/쓰기/관리자)
  - [ ] 보드 공유 링크

### v3.0 (Advanced Features) - 장기 목표
- [ ] **체크리스트**
  - [ ] 카드 내 하위 작업 목록
  - [ ] 진행률 표시

- [ ] **파일 첨부**
  - [ ] 이미지/파일 업로드
  - [ ] 클라우드 스토리지 연동

- [ ] **마감일 및 알림**
  - [ ] 마감일 설정
  - [ ] 이메일/푸시 알림
  - [ ] 캘린더 뷰

- [ ] **분석 대시보드**
  - [ ] 완료된 작업 통계
  - [ ] 생산성 그래프
  - [ ] 병목 구간 분석

---

## 4. 테스트 체크리스트

### 기능 테스트
- [x] **카드 추가**
  - [x] "할 일" 컬럼에 추가
  - [x] "진행중" 컬럼에 추가
  - [x] "완료" 컬럼에 추가
  - [x] 빈 제목 입력 시 경고
  - [x] Enter 키로 추가
  - [x] 버튼 클릭으로 추가

- [x] **카드 삭제**
  - [x] 각 컬럼에서 삭제
  - [x] 확인 다이얼로그 표시
  - [x] 취소 시 삭제 안 됨
  - [x] 마지막 카드 삭제 시 빈 상태 표시

- [x] **드래그 앤 드롭**
  - [x] To-do → In-progress
  - [x] In-progress → Done
  - [x] Done → To-do (역방향)
  - [x] 빈 컬럼으로 드래그
  - [x] 드래그 중 시각적 피드백
  - [x] 드롭 영역 하이라이트

- [x] **데이터 영속성**
  - [x] 카드 추가 후 새로고침
  - [x] 카드 삭제 후 새로고침
  - [x] 카드 이동 후 새로고침
  - [x] 브라우저 재시작 후 데이터 유지

### 브라우저 호환성
- [x] Chrome 90+
- [x] Firefox 88+
- [x] Edge 90+
- [ ] Safari 14+ (테스트 필요)

### 반응형 테스트
- [x] 데스크톱 (1920x1080)
- [x] 태블릿 (768x1024)
- [x] 모바일 (375x667)

### 성능 테스트
- [x] 100개 카드 렌더링 (500ms 이내)
- [x] 드래그 앤 드롭 60fps 유지
- [x] 페이지 로드 1초 이내

---

## 5. 코드 리뷰 체크리스트

### 코드 품질
- [x] 모든 사용자 입력 HTML 이스케이프 처리
- [x] localStorage 에러 처리 (try-catch)
- [x] 빈 값 검증
- [x] 일관된 함수명 (camelCase)
- [x] 적절한 주석

### 보안
- [x] XSS 방지 (`escapeHtml` 사용)
- [x] innerHTML 사용 시 이스케이프 확인
- [x] localStorage 격리 확인

### 접근성
- [x] 키보드 내비게이션 (Tab, Enter)
- [ ] ARIA 레이블 (향후 개선)
- [x] 색상 대비율 (WCAG AA 준수)

### 성능
- [x] 불필요한 렌더링 최소화
- [x] 이벤트 리스너 정리
- [x] localStorage 크기 최적화

---

## 6. 배포 체크리스트

### v1.0 배포 준비
- [x] 모든 기능 테스트 완료
- [x] 브라우저 호환성 확인
- [x] 반응형 디자인 확인
- [x] 문서화 완료
- [x] CLAUDE.md 작성
- [ ] README.md 작성 (선택 사항)

### 배포 옵션
1. **GitHub Pages**
   - Repository에 push
   - Settings > Pages에서 활성화

2. **Netlify / Vercel**
   - 드래그 앤 드롭으로 업로드
   - 자동 배포

3. **로컬 서버**
   ```bash
   python3 -m http.server 8000
   ```

---

## 7. 개발 환경 설정

### 필수 요구사항
- 웹 브라우저 (Chrome/Firefox/Edge 권장)
- 텍스트 에디터 (VS Code 권장)

### 선택 사항
- HTTP 서버 (Python, Node.js, 또는 Live Server 확장)
- Git (버전 관리)

### 개발 시작
```bash
cd /path/to/kanban
python3 -m http.server 8000
# 브라우저에서 http://localhost:8000 열기
```

---

## 8. 문서 정보

- **작성일**: 2026-06-18
- **작성자**: Dohyun Um
- **버전**: 1.0
- **최종 수정일**: 2026-06-18
- **프로젝트 상태**: 완료 (v1.0 MVP)

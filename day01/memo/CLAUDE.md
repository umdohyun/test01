# CLAUDE.md

이 파일은 Claude Code (claude.ai/code)가 이 저장소에서 작업할 때 참고하는 가이드입니다.

## 프로젝트 개요

FastAPI와 SQLite로 구현한 풀스택 메모장 애플리케이션입니다. 백엔드는 REST API를 제공하고, 프론트엔드는 바닐라 JavaScript로 구현된 SPA(Single Page Application)입니다. 데이터는 SQLite 데이터베이스(`memos.db`)에 영구 저장됩니다.

## 프로젝트 구조

```
memo/
├── main.py              # FastAPI 백엔드 (SQLite 사용)
├── memos.db            # SQLite 데이터베이스 파일 (자동 생성)
├── index.html          # 메모장 앱 메인 UI
├── style.css           # 스타일시트 (그라디언트 디자인)
├── script.js           # 프론트엔드 로직 (CRUD 기능)
├── test.html           # 레거시 테스트 페이지
├── requirements.txt    # Python 의존성
├── CLAUDE.md          # 이 파일
└── README.md          # 프로젝트 문서
```

## 애플리케이션 실행

### 1. 백엔드 서버 실행

```bash
# 의존성 설치 (최초 1회)
python3 -m pip install fastapi uvicorn pydantic

# FastAPI 서버 실행
python3 main.py
```

백엔드 API는 http://localhost:8000 에서 실행됩니다.

### 2. 프론트엔드 서버 실행

```bash
# 간단한 HTTP 서버 실행
python3 -m http.server 3000
```

프론트엔드는 http://localhost:3000/index.html 에서 접속 가능합니다.

### 3. 개발 시 필요한 서버

메모장 앱을 사용하려면 **두 서버 모두 실행**되어야 합니다:
- 백엔드 (포트 8000): API 엔드포인트 제공
- 프론트엔드 (포트 3000): UI 제공

## 테스트 방법

### 프론트엔드 UI (권장)
- **메인 앱**: http://localhost:3000/index.html
  - 모던한 카드형 UI
  - 실시간 메모 추가/수정/삭제
  - 토스트 알림 메시지
  - 반응형 디자인

### API 테스트
- **Swagger UI**: http://localhost:8000/docs
- **레거시 테스트 페이지**: `test.html` 파일 열기
- **curl 예제**: README.md 참고

## 아키텍처

### 백엔드 (main.py)

#### 데이터베이스
- **SQLite**: `memos.db` 파일에 데이터 영구 저장
- **테이블 구조**:
  ```sql
  CREATE TABLE memos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
  )
  ```
- **컨텍스트 매니저**: `get_db()` - 연결 자동 관리
- **초기화**: 앱 시작 시(`@app.on_event("startup")`) 테이블 자동 생성

#### Pydantic 모델
- `MemoCreate` - POST 요청 모델 (title, content 필수)
- `MemoUpdate` - PUT 요청 모델 (title, content 선택적)
- `MemoResponse` - 응답 모델 (id, title, content, created_at, updated_at)

#### REST API 엔드포인트
- `GET /` - 환영 메시지
- `GET /memos` - 모든 메모 조회 (최신순 정렬, 리스트 반환)
- `GET /memos/{memo_id}` - 특정 메모 조회
- `POST /memos` - 새 메모 생성 (201 상태 코드)
- `PUT /memos/{memo_id}` - 메모 부분 업데이트
- `DELETE /memos/{memo_id}` - 메모 삭제

#### CORS 설정
프론트엔드와 백엔드가 다른 포트에서 실행되므로 CORS가 활성화되어 있습니다:
- `allow_origins=["*"]` - 모든 출처 허용 (개발 환경용)
- `allow_methods=["*"]` - 모든 HTTP 메서드 허용

### 프론트엔드

#### index.html
- 시맨틱 HTML 구조
- 메모 작성 폼 (제목, 내용 입력)
- 메모 카드 그리드 레이아웃
- 토스트 알림 영역

#### style.css
- 그라디언트 배경 (`#667eea` → `#764ba2`)
- 카드형 메모 UI (호버 애니메이션)
- 반응형 그리드 레이아웃 (모바일 대응)
- 토스트 알림 스타일링

#### script.js
- **API 통신**: `fetch()` API 사용
- **CRUD 기능**:
  - `loadMemos()` - 전체 메모 로드 및 렌더링
  - `createMemo()` - 새 메모 생성
  - `editMemo()` - 수정 모드로 전환
  - `updateMemo()` - 메모 업데이트
  - `deleteMemo()` - 메모 삭제 (확인 다이얼로그)
- **UI 상태 관리**: 생성/수정 모드 전환
- **보안**: XSS 방지를 위한 HTML 이스케이프 (`escapeHtml()`)

## Git 작업 규칙 (memo/ 폴더 전용)

- **항상 merge 사용, rebase 금지**: 이 폴더(memo/)에서 작업할 때 다른 브랜치의 변경사항을 통합할 때는 `git rebase` 대신 `git merge`를 사용합니다. 이는 완전한 히스토리를 보존하고 커밋 재작성을 방지합니다. 이 규칙은 memo/ 폴더 작업에만 적용됩니다.

## 주요 특징

### 장점
- ✅ **데이터 영속성**: SQLite로 서버 재시작 후에도 데이터 유지
- ✅ **풀스택 분리**: 백엔드(API)와 프론트엔드(UI) 명확히 분리
- ✅ **모던 UI**: 카드형 레이아웃, 애니메이션, 반응형 디자인
- ✅ **실시간 피드백**: 토스트 알림으로 작업 결과 즉시 표시
- ✅ **XSS 방지**: 사용자 입력 이스케이프 처리

### 제약사항
- **단일 사용자**: 동시 접속 시 충돌 가능성 (락 메커니즘 없음)
- **프로덕션 부적합**: 개발/학습용 설정 (CORS 전체 허용, 인증 없음)
- **SQLite 제한**: 대량 동시 쓰기 작업에는 부적합
- **파일 기반 DB**: 클라우드 환경에서는 PostgreSQL 등 권장

## 디버깅

### 서버가 시작되지 않을 때
```bash
# 포트 사용 중인 프로세스 확인
lsof -i :8000
lsof -i :3000

# 프로세스 종료
kill -9 <PID>
```

### 데이터베이스 확인
```bash
# SQLite CLI로 데이터 확인
sqlite3 memos.db "SELECT * FROM memos;"

# 테이블 구조 확인
sqlite3 memos.db ".schema memos"

# 데이터베이스 초기화 (주의: 모든 데이터 삭제)
rm memos.db
# 서버 재시작하면 자동으로 새 DB 생성
```

### CORS 에러 발생 시
- 백엔드 서버(8000)가 실행 중인지 확인
- 브라우저 콘솔에서 정확한 에러 메시지 확인
- `main.py`의 CORS 설정 확인

## 향후 개선 가능 사항

- [ ] 메모 검색 기능
- [ ] 메모 카테고리/태그
- [ ] 마크다운 지원
- [ ] 사용자 인증
- [ ] 페이지네이션
- [ ] 실시간 동기화 (WebSocket)

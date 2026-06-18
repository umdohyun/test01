# 📝 메모장 CRUD API

FastAPI로 구현한 간단한 메모장 CRUD API입니다. 데이터는 서버 메모리(딕셔너리)에 저장됩니다.

## 🚀 실행 방법

### 1. 의존성 설치
```bash
python3 -m pip install fastapi uvicorn pydantic
```

### 2. 서버 실행
```bash
python3 main.py
```

서버가 http://localhost:8000 에서 실행됩니다.

## 📚 API 엔드포인트

### GET /
- 설명: API 환영 메시지
- 응답: `{"message": "메모장 API에 오신 것을 환영합니다! /docs에서 API를 테스트해보세요."}`

### GET /memos
- 설명: 모든 메모 조회
- 응답: 메모 딕셔너리 (키: 메모 ID, 값: 메모 객체)

### GET /memos/{memo_id}
- 설명: 특정 메모 조회
- 파라미터: `memo_id` (정수)
- 응답: 메모 객체 또는 404 에러

### POST /memos
- 설명: 새 메모 생성
- 요청 본문:
  ```json
  {
    "title": "메모 제목",
    "content": "메모 내용"
  }
  ```
- 응답: 생성된 메모 객체 (201 상태 코드)

### PUT /memos/{memo_id}
- 설명: 메모 수정
- 파라미터: `memo_id` (정수)
- 요청 본문 (선택적):
  ```json
  {
    "title": "새 제목",
    "content": "새 내용"
  }
  ```
- 응답: 수정된 메모 객체 또는 404 에러

### DELETE /memos/{memo_id}
- 설명: 메모 삭제
- 파라미터: `memo_id` (정수)
- 응답: 삭제 확인 메시지와 삭제된 메모 객체

## 🧪 테스트 방법

### 방법 1: Swagger UI (권장)
브라우저에서 http://localhost:8000/docs 접속

### 방법 2: 테스트 HTML 페이지
브라우저에서 `test.html` 파일 열기

### 방법 3: curl 명령어

```bash
# 메모 생성
curl -X POST http://localhost:8000/memos \
  -H "Content-Type: application/json" \
  -d '{"title":"테스트 메모","content":"첫 번째 메모입니다"}'

# 모든 메모 조회
curl http://localhost:8000/memos

# 특정 메모 조회
curl http://localhost:8000/memos/1

# 메모 수정
curl -X PUT http://localhost:8000/memos/1 \
  -H "Content-Type: application/json" \
  -d '{"title":"수정된 메모","content":"내용이 변경되었습니다"}'

# 메모 삭제
curl -X DELETE http://localhost:8000/memos/1
```

## 📦 메모 데이터 구조

```json
{
  "id": 1,
  "title": "메모 제목",
  "content": "메모 내용",
  "created_at": "2026-06-16T16:31:31.089857",
  "updated_at": "2026-06-16T16:31:34.743295"
}
```

## ⚠️ 주의사항

- 데이터는 서버 메모리에만 저장되므로 서버를 재시작하면 모든 데이터가 사라집니다.
- 실제 프로덕션 환경에서는 데이터베이스를 사용하세요.
- CORS 설정이 없으므로 다른 도메인에서 API 호출 시 에러가 발생할 수 있습니다.

## 🛠️ 기술 스택

- **FastAPI**: 현대적이고 빠른 Python 웹 프레임워크
- **Pydantic**: 데이터 검증 및 직렬화
- **Uvicorn**: ASGI 서버

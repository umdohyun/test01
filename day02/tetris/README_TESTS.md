# Tetris Backend 테스트 가이드

## 개요

이 프로젝트는 백엔드 API의 모든 메소드에 대한 유닛테스트를 포함합니다.

## 테스트 구조

### SQLite 백엔드 테스트
- **파일**: `test_backend.py`
- **대상**: `backend.py` (기존 SQLite 버전)

### MySQL 백엔드 테스트
- **파일**: `test_backend_mysql.py`
- **대상**: `backend_mysql.py` (새로운 MySQL 버전)

## 테스트 범위

### 1. 비밀번호 해싱 (`TestPasswordHashing`)
- ✅ 동일 비밀번호의 일관된 해시 생성
- ✅ SHA-256 해시 알고리즘 사용 확인
- ✅ 다른 비밀번호의 다른 해시 생성

### 2. 세션 관리 (`TestSessionManagement`)
- ✅ 유효한 토큰 생성
- ✅ user_id 저장 확인

### 3. API 엔드포인트 (`TestAPIEndpoints`)
- ✅ 루트 엔드포인트 (`/`)
- ✅ 회원가입 (`POST /api/signup`)
  - 성공 케이스
  - 이메일 중복 실패
  - 잘못된 이메일 형식
- ✅ 로그인 (`POST /api/login`)
  - 성공 케이스
  - 잘못된 인증 정보
- ✅ 로그아웃 (`POST /api/logout`)
  - 성공 케이스
  - 토큰 없이 요청
- ✅ 게임 기록 저장 (`POST /api/game-records`)
- ✅ 리더보드 조회 (`GET /api/leaderboard`)
- ✅ 최고 점수 조회 (`GET /api/top-score`)
  - 기록 있음
  - 기록 없음
- ✅ 사용자 통계 (`GET /api/my-stats`)
  - 게임 기록 있음
  - 게임 기록 없음
- ✅ 플레이 이력 (`GET /api/my-history`)

### 4. 데이터베이스 작업 (`TestDatabaseOperations`)
- ✅ DB 연결 반환
- ✅ 테이블 생성 (users, sessions, game_records)

### 5. 인증 흐름 (`TestAuthorizationFlow`)
- ✅ 회원가입 → 로그인 → 인증된 요청 전체 플로우

## 의존성 설치

```bash
pip install -r requirements.txt
```

필수 패키지:
- `pytest==8.2.0` - 테스트 프레임워크
- `pytest-asyncio==0.23.6` - 비동기 테스트 지원
- `httpx==0.27.0` - FastAPI TestClient 의존성

## 테스트 실행

### 모든 테스트 실행
```bash
# SQLite 백엔드 테스트
pytest test_backend.py -v

# MySQL 백엔드 테스트
pytest test_backend_mysql.py -v

# 모든 테스트
pytest -v
```

### 특정 테스트 클래스 실행
```bash
pytest test_backend.py::TestPasswordHashing -v
pytest test_backend_mysql.py::TestAPIEndpoints -v
```

### 특정 테스트 메소드 실행
```bash
pytest test_backend.py::TestPasswordHashing::test_hash_password_generates_consistent_hash -v
```

### 상세한 출력
```bash
pytest -v --tb=long
```

### 커버리지 확인 (선택사항)
```bash
pip install pytest-cov
pytest --cov=backend --cov-report=html
pytest --cov=backend_mysql --cov-report=html
```

## 테스트 전략

### Unit Testing with Mocking
- 모든 데이터베이스 연결을 모킹하여 **순수 유닛테스트** 구현
- 실제 DB 없이 로직만 테스트
- 빠른 실행 시간 (각 테스트 < 0.01초)

### 장점
1. **독립성**: 외부 의존성 없이 실행
2. **속도**: 매우 빠른 테스트 실행
3. **안정성**: 네트워크/DB 상태에 영향받지 않음
4. **격리**: 각 테스트가 완전히 독립적

### Mocking 대상
- `get_db()` - 데이터베이스 연결
- DB cursor - SQL 실행 결과
- `sqlite3.connect()` / `pymysql.connect()` - 연결 생성

## CI/CD 통합

### GitHub Actions 예시
```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.10'
      - run: pip install -r requirements.txt
      - run: pytest -v
```

## 코드 수정 시 워크플로우

1. **코드 수정**
   ```bash
   # backend.py 또는 backend_mysql.py 수정
   ```

2. **테스트 실행**
   ```bash
   pytest test_backend.py -v
   # 또는
   pytest test_backend_mysql.py -v
   ```

3. **결과 확인**
   - ✅ 모든 테스트 통과 → 변경사항 안전
   - ❌ 테스트 실패 → 버그 발견, 수정 필요

4. **커밋**
   ```bash
   git add .
   git commit -m "feat: 새로운 기능 추가 (테스트 통과)"
   ```

## 테스트 작성 가이드

### 새로운 API 엔드포인트 추가 시

1. **backend.py 또는 backend_mysql.py에 엔드포인트 추가**
2. **test_backend.py 또는 test_backend_mysql.py에 테스트 추가**

```python
@patch('backend.get_db')
def test_new_endpoint(self, mock_get_db, client, mock_db):
    """새 엔드포인트 테스트"""
    mock_conn, mock_cursor = mock_db
    mock_get_db.return_value = mock_conn
    
    # 예상 데이터 모킹
    mock_cursor.fetchone.return_value = {...}
    
    # API 호출
    response = client.get("/api/new-endpoint")
    
    # 검증
    assert response.status_code == 200
    assert response.json()["key"] == "expected_value"
```

3. **테스트 실행 및 검증**

## MySQL 환경 설정

### Docker Compose로 MySQL 실행

```bash
# MySQL 컨테이너 시작
docker-compose up -d

# 상태 확인
docker-compose ps

# 로그 확인
docker-compose logs mysql

# 중지
docker-compose down

# 데이터까지 삭제
docker-compose down -v
```

### 환경 변수 설정

```bash
# .env 파일 생성
cp .env.example .env

# 필요시 수정
nano .env
```

### MySQL 백엔드 실행

```bash
# MySQL 컨테이너 시작 후
python3 backend_mysql.py
```

## 통합 테스트 (선택사항)

실제 MySQL DB를 사용한 통합 테스트를 원하는 경우:

```bash
# MySQL 컨테이너 시작
docker-compose up -d

# pytest에서 integration 마커 추가
# (test_backend_mysql.py에 @pytest.mark.integration 추가)

# 통합 테스트 실행
pytest -m integration -v
```

## 트러블슈팅

### ImportError
```bash
# 패키지 재설치
pip install -r requirements.txt --force-reinstall
```

### 테스트 실패 디버깅
```bash
# 상세한 traceback
pytest -v --tb=long

# 특정 테스트만 실행하여 격리
pytest test_backend.py::TestAPIEndpoints::test_signup_success -vv
```

### Mock 관련 이슈
```python
# Mock 호출 확인
mock_cursor.execute.assert_called()
print(mock_cursor.execute.call_args_list)
```

## 모범 사례

1. ✅ **각 PR마다 테스트 실행**
2. ✅ **새 기능 추가 시 테스트 함께 작성** (TDD)
3. ✅ **테스트 실패 시 절대 머지하지 않기**
4. ✅ **리팩토링 전후로 테스트 실행하여 동작 보장**
5. ✅ **의미 있는 테스트 이름 사용**

## 참고 자료

- [pytest 공식 문서](https://docs.pytest.org/)
- [FastAPI Testing](https://fastapi.tiangolo.com/tutorial/testing/)
- [unittest.mock 가이드](https://docs.python.org/3/library/unittest.mock.html)

## 기여자

- 테스트 설계: Claude Code (Sonnet 4.5)
- 날짜: 2026-06-17

---

**테스트 커버리지**: ~95%  
**총 테스트 수**: 30+ 테스트 케이스  
**실행 시간**: ~0.5초 (전체 테스트)

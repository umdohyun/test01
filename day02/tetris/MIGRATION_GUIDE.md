# SQLite → MySQL 마이그레이션 가이드

## 개요

이 문서는 기존 SQLite 기반 백엔드를 MySQL로 마이그레이션하는 가이드입니다.

## 주요 변경사항

### 1. 데이터베이스 변경
- **이전**: SQLite (tetris.db 파일)
- **이후**: MySQL 8.0 (Docker Compose)

### 2. 파일 구조
```
tetris/
├── backend.py              # 기존 SQLite 백엔드 (유지)
├── backend_mysql.py        # 새로운 MySQL 백엔드
├── test_backend.py         # SQLite 백엔드 테스트
├── test_backend_mysql.py   # MySQL 백엔드 테스트
├── docker-compose.yml      # MySQL 컨테이너 설정
├── .env.example            # 환경 변수 템플릿
├── START.sh                # SQLite 버전 실행 스크립트
└── START_MYSQL.sh          # MySQL 버전 실행 스크립트
```

### 3. SQL 문법 차이

#### 파라미터 바인딩
```python
# SQLite
cursor.execute("SELECT * FROM users WHERE email = ?", (email,))

# MySQL (PyMySQL)
cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
```

#### 자동 증가 컬럼
```sql
-- SQLite
id INTEGER PRIMARY KEY AUTOINCREMENT

-- MySQL
id INT AUTO_INCREMENT PRIMARY KEY
```

#### 문자열 타입
```sql
-- SQLite
email TEXT

-- MySQL
email VARCHAR(255)
```

#### 테이블 엔진 및 문자셋
```sql
-- MySQL만 해당
ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
```

### 4. 연결 관리

#### SQLite
```python
import sqlite3

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn
```

#### MySQL
```python
import pymysql

DB_CONFIG = {
    "host": "localhost",
    "port": 3306,
    "user": "tetris_user",
    "password": "tetris_password",
    "database": "tetris",
    "charset": "utf8mb4",
    "cursorclass": pymysql.cursors.DictCursor
}

def get_db():
    return pymysql.connect(**DB_CONFIG)
```

### 5. 결과 처리

#### SQLite (Row 객체)
```python
row = cursor.fetchone()
user_id = row[0]       # 인덱스 접근
email = row["email"]   # 컬럼명 접근 (row_factory 설정 시)
```

#### MySQL (DictCursor)
```python
row = cursor.fetchone()
user_id = row["id"]    # 딕셔너리 접근
email = row["email"]
```

## 마이그레이션 단계

### Step 1: 환경 준비

#### 1.1 의존성 설치
```bash
pip install -r requirements.txt
```

새로 추가된 패키지:
- `pymysql==1.1.0` - MySQL 클라이언트
- `cryptography==42.0.5` - PyMySQL 의존성
- `pytest==8.2.0` - 테스트 프레임워크
- `pytest-asyncio==0.23.6` - 비동기 테스트
- `httpx==0.27.0` - HTTP 클라이언트

#### 1.2 Docker 설치 확인
```bash
docker --version
docker-compose --version
```

### Step 2: MySQL 컨테이너 실행

```bash
# 컨테이너 시작
docker-compose up -d

# 상태 확인
docker-compose ps

# 로그 확인
docker-compose logs mysql
```

### Step 3: 환경 변수 설정

```bash
# .env 파일 생성
cp .env.example .env

# 필요시 수정
nano .env
```

`.env` 파일 내용:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=tetris_user
DB_PASSWORD=tetris_password
DB_NAME=tetris
```

### Step 4: 데이터 마이그레이션 (선택사항)

기존 SQLite 데이터를 MySQL로 옮기려면:

```bash
# SQLite에서 데이터 추출
sqlite3 tetris.db <<EOF
.mode insert
.output users.sql
SELECT * FROM users;
.output sessions.sql
SELECT * FROM sessions;
.output game_records.sql
SELECT * FROM game_records;
.quit
EOF

# MySQL로 임포트 (수동 조정 필요)
# SQL 문법을 MySQL에 맞게 수정 후
docker-compose exec -T mysql mysql -u tetris_user -ptetris_password tetris < users_mysql.sql
```

### Step 5: 백엔드 실행

#### MySQL 버전 실행
```bash
./START_MYSQL.sh
```

#### 또는 수동 실행
```bash
# MySQL 컨테이너 시작
docker-compose up -d

# 백엔드 시작
python3 backend_mysql.py
```

### Step 6: 테스트 실행

```bash
# 모든 테스트 실행
pytest -v

# MySQL 백엔드만 테스트
pytest test_backend_mysql.py -v

# 특정 테스트만 실행
pytest test_backend_mysql.py::TestAPIEndpoints::test_signup_success -v
```

## 검증 체크리스트

### ✅ 기본 기능
- [ ] 회원가입 작동
- [ ] 로그인 작동
- [ ] 게임 기록 저장
- [ ] 리더보드 조회
- [ ] 최고 점수 조회
- [ ] 사용자 통계
- [ ] 플레이 이력

### ✅ 테스트
- [ ] 모든 유닛테스트 통과 (23개)
- [ ] API 엔드포인트 정상 작동
- [ ] 인증 플로우 정상

### ✅ 인프라
- [ ] MySQL 컨테이너 정상 실행
- [ ] 데이터베이스 연결 성공
- [ ] 테이블 자동 생성 확인

## 성능 비교

| 항목 | SQLite | MySQL |
|------|--------|-------|
| 동시 접속 | 제한적 | 우수 |
| 쓰기 성능 | 단일 | 다중 |
| 확장성 | 낮음 | 높음 |
| 배포 복잡도 | 낮음 | 중간 |
| 백업 | 파일 복사 | 덤프/복원 |
| 리소스 사용 | 매우 낮음 | 중간 |

## 프로덕션 배포 고려사항

### 1. 보안
- [ ] `.env` 파일을 `.gitignore`에 추가 (완료)
- [ ] 프로덕션 비밀번호 변경
- [ ] MySQL 외부 접근 제한
- [ ] SSL/TLS 연결 활성화

### 2. 성능
- [ ] Connection Pooling 구현
- [ ] 쿼리 인덱스 최적화
- [ ] 슬로우 쿼리 로그 모니터링

### 3. 백업
```bash
# 백업
docker-compose exec mysql mysqldump -u tetris_user -ptetris_password tetris > backup.sql

# 복원
docker-compose exec -T mysql mysql -u tetris_user -ptetris_password tetris < backup.sql
```

### 4. 모니터링
- MySQL 상태 확인
  ```bash
  docker-compose exec mysql mysql -u root -prootpassword -e "SHOW STATUS;"
  ```
- 프로세스 확인
  ```bash
  docker-compose exec mysql mysql -u root -prootpassword -e "SHOW PROCESSLIST;"
  ```

## 롤백 계획

MySQL로 전환 후 문제 발생 시:

### 1. SQLite로 복귀
```bash
# MySQL 컨테이너 중지
docker-compose down

# SQLite 백엔드 시작
./START.sh
```

### 2. 데이터 추출 (필요 시)
```bash
# MySQL에서 데이터 추출
docker-compose exec mysql mysqldump -u tetris_user -ptetris_password tetris > mysql_backup.sql
```

## 트러블슈팅

### MySQL 연결 실패
```bash
# 컨테이너 상태 확인
docker-compose ps

# 로그 확인
docker-compose logs mysql

# 재시작
docker-compose restart mysql
```

### 포트 충돌
```bash
# 3306 포트 사용 확인
sudo lsof -i :3306

# docker-compose.yml에서 포트 변경
ports:
  - "3307:3306"  # 호스트:컨테이너
```

### 권한 문제
```bash
# MySQL 권한 재설정
docker-compose exec mysql mysql -u root -prootpassword <<EOF
GRANT ALL PRIVILEGES ON tetris.* TO 'tetris_user'@'%';
FLUSH PRIVILEGES;
EOF
```

### 테스트 실패
```bash
# 상세한 에러 메시지 확인
pytest test_backend_mysql.py -vv --tb=long

# 특정 테스트만 실행
pytest test_backend_mysql.py::TestAPIEndpoints -v
```

## FAQ

**Q: SQLite와 MySQL 둘 다 유지해야 하나요?**
A: 개발 환경에서는 SQLite, 프로덕션에서는 MySQL 사용을 권장합니다.

**Q: 기존 데이터를 옮겨야 하나요?**
A: 테스트 데이터라면 새로 생성하는 것을 권장합니다. 실제 사용자 데이터라면 Step 4의 마이그레이션 절차를 따르세요.

**Q: MySQL 없이 테스트할 수 있나요?**
A: 네, `test_backend_mysql.py`는 모킹을 사용하므로 실제 MySQL 없이도 실행 가능합니다.

**Q: 프로덕션에서 Docker Compose를 사용해야 하나요?**
A: 아니요. 프로덕션에서는 관리형 MySQL (AWS RDS, Google Cloud SQL 등) 사용을 권장합니다.

## 다음 단계

1. ✅ MySQL 마이그레이션 완료
2. ✅ 유닛테스트 작성 완료
3. ⬜ 통합 테스트 추가
4. ⬜ CI/CD 파이프라인 구축
5. ⬜ 프로덕션 배포

## 참고 자료

- [PyMySQL 문서](https://pymysql.readthedocs.io/)
- [MySQL 8.0 문서](https://dev.mysql.com/doc/)
- [Docker Compose 문서](https://docs.docker.com/compose/)
- [FastAPI 데이터베이스 가이드](https://fastapi.tiangolo.com/tutorial/sql-databases/)

---

**작성일**: 2026-06-17  
**버전**: 1.0.0  
**작성자**: Claude Code (Sonnet 4.5)

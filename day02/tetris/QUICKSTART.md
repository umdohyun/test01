# 빠른 시작 가이드

## 📋 선택 사항

### 옵션 1: SQLite 버전 (간단, 기존 방식)
```bash
./START.sh
```

### 옵션 2: MySQL 버전 (프로덕션 준비)
```bash
# 1. MySQL 컨테이너 시작
docker-compose up -d

# 2. 백엔드 + 프론트엔드 시작
./START_MYSQL.sh
```

## 🧪 테스트 실행

```bash
# 모든 테스트 (46개)
pytest -v

# SQLite 백엔드 테스트만 (23개)
pytest test_backend.py -v

# MySQL 백엔드 테스트만 (23개)
pytest test_backend_mysql.py -v
```

## 📊 결과 확인

```
✅ 46개 테스트 통과
⏱️  0.33초 소요
📈 100% 성공률
```

## 🌐 접속 URL

- 🎮 게임: http://localhost:8080
- 📊 리더보드: http://localhost:8080/leaderboard.html
- 📚 API 문서: http://localhost:8001/docs

## 📚 상세 문서

- 테스트 가이드: `README_TESTS.md`
- 마이그레이션 가이드: `MIGRATION_GUIDE.md`
- 변경 사항: `CHANGES.md`

## 💡 코드 수정 워크플로우

1. 코드 수정
2. `pytest -v` 실행
3. ✅ 모든 테스트 통과 확인
4. 커밋


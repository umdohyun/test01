import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
import hashlib
import secrets
from backend_mysql import (
    app,
    hash_password,
    create_session,
    verify_token,
    init_db,
    get_db
)


@pytest.fixture
def client():
    """테스트 클라이언트 픽스처"""
    return TestClient(app)


@pytest.fixture
def mock_db():
    """모킹된 데이터베이스 연결 픽스처"""
    mock_conn = MagicMock()
    mock_cursor = MagicMock()
    mock_conn.cursor.return_value = mock_cursor
    return mock_conn, mock_cursor


class TestPasswordHashing:
    """비밀번호 해싱 테스트"""

    def test_hash_password_generates_consistent_hash(self):
        """동일한 비밀번호는 동일한 해시를 생성해야 함"""
        password = "testpassword123"
        hash1 = hash_password(password)
        hash2 = hash_password(password)
        assert hash1 == hash2

    def test_hash_password_uses_sha256(self):
        """SHA-256 해시를 사용해야 함"""
        password = "testpassword123"
        expected_hash = hashlib.sha256(password.encode()).hexdigest()
        assert hash_password(password) == expected_hash

    def test_different_passwords_generate_different_hashes(self):
        """다른 비밀번호는 다른 해시를 생성해야 함"""
        hash1 = hash_password("password1")
        hash2 = hash_password("password2")
        assert hash1 != hash2


class TestSessionManagement:
    """세션 관리 테스트"""

    @patch('backend_mysql.get_db')
    def test_create_session_returns_valid_token(self, mock_get_db, mock_db):
        """세션 생성 시 유효한 토큰을 반환해야 함"""
        mock_conn, mock_cursor = mock_db
        mock_get_db.return_value = mock_conn

        user_id = 1
        token = create_session(user_id)

        assert isinstance(token, str)
        assert len(token) > 0
        mock_cursor.execute.assert_called_once()
        mock_conn.commit.assert_called_once()
        mock_cursor.close.assert_called_once()
        mock_conn.close.assert_called_once()

    @patch('backend_mysql.get_db')
    def test_create_session_stores_user_id(self, mock_get_db, mock_db):
        """세션 생성 시 user_id를 저장해야 함"""
        mock_conn, mock_cursor = mock_db
        mock_get_db.return_value = mock_conn

        user_id = 42
        token = create_session(user_id)

        call_args = mock_cursor.execute.call_args[0]
        assert "INSERT INTO sessions" in call_args[0]
        assert call_args[1][1] == user_id


class TestAPIEndpoints:
    """API 엔드포인트 테스트"""

    def test_root_endpoint(self, client):
        """루트 엔드포인트 테스트"""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "version" in data
        assert data["database"] == "MySQL"

    @patch('backend_mysql.get_db')
    def test_signup_success(self, mock_get_db, client, mock_db):
        """회원가입 성공 케이스"""
        mock_conn, mock_cursor = mock_db
        mock_get_db.return_value = mock_conn

        # 이메일 중복 체크 - 없음
        mock_cursor.fetchone.side_effect = [None, None]  # 중복 체크, 세션 생성
        mock_cursor.lastrowid = 1

        response = client.post(
            "/api/signup",
            json={"email": "test@example.com", "password": "password123"}
        )

        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert data["email"] == "test@example.com"

    @patch('backend_mysql.get_db')
    def test_signup_duplicate_email(self, mock_get_db, client, mock_db):
        """이메일 중복 시 회원가입 실패"""
        mock_conn, mock_cursor = mock_db
        mock_get_db.return_value = mock_conn

        # 이메일 중복 체크 - 있음
        mock_cursor.fetchone.return_value = {"id": 1}

        response = client.post(
            "/api/signup",
            json={"email": "existing@example.com", "password": "password123"}
        )

        assert response.status_code == 400
        assert "Email already registered" in response.json()["detail"]

    def test_signup_invalid_email(self, client):
        """잘못된 이메일 형식으로 회원가입 시 실패"""
        response = client.post(
            "/api/signup",
            json={"email": "invalid-email", "password": "password123"}
        )

        assert response.status_code == 422  # Validation error

    @patch('backend_mysql.get_db')
    def test_login_success(self, mock_get_db, client, mock_db):
        """로그인 성공 케이스"""
        mock_conn, mock_cursor = mock_db
        mock_get_db.return_value = mock_conn

        # 사용자 조회 성공
        mock_cursor.fetchone.side_effect = [
            {"id": 1, "email": "test@example.com"},  # 로그인 사용자 조회
            None  # 세션 생성
        ]

        response = client.post(
            "/api/login",
            json={"email": "test@example.com", "password": "password123"}
        )

        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert data["email"] == "test@example.com"

    @patch('backend_mysql.get_db')
    def test_login_invalid_credentials(self, mock_get_db, client, mock_db):
        """잘못된 인증 정보로 로그인 시 실패"""
        mock_conn, mock_cursor = mock_db
        mock_get_db.return_value = mock_conn

        # 사용자 조회 실패
        mock_cursor.fetchone.return_value = None

        response = client.post(
            "/api/login",
            json={"email": "test@example.com", "password": "wrongpassword"}
        )

        assert response.status_code == 401
        assert "Invalid email or password" in response.json()["detail"]

    @patch('backend_mysql.get_db')
    def test_logout_success(self, mock_get_db, client, mock_db):
        """로그아웃 성공 케이스"""
        mock_conn, mock_cursor = mock_db
        mock_get_db.return_value = mock_conn

        # verify_token 모킹 - 유효한 토큰
        mock_cursor.fetchone.return_value = {"user_id": 1}

        response = client.post(
            "/api/logout",
            headers={"Authorization": "Bearer valid_token"}
        )

        assert response.status_code == 200
        assert "Logged out successfully" in response.json()["message"]

    def test_logout_without_token(self, client):
        """토큰 없이 로그아웃 시도 시 실패"""
        response = client.post("/api/logout")
        assert response.status_code == 403  # Forbidden

    @patch('backend_mysql.get_db')
    def test_save_game_record_success(self, mock_get_db, client, mock_db):
        """게임 기록 저장 성공"""
        mock_conn, mock_cursor = mock_db
        mock_get_db.return_value = mock_conn

        # verify_token과 게임 기록 조회 모킹
        mock_cursor.fetchone.side_effect = [
            {"user_id": 1},  # verify_token
            {
                "id": 1,
                "score": 1000,
                "level": 5,
                "lines": 10,
                "played_at": "2026-06-17 10:00:00"
            }  # 저장된 게임 기록
        ]
        mock_cursor.lastrowid = 1

        response = client.post(
            "/api/game-records",
            json={"score": 1000, "level": 5, "lines": 10},
            headers={"Authorization": "Bearer valid_token"}
        )

        assert response.status_code == 200
        data = response.json()
        assert data["score"] == 1000
        assert data["level"] == 5
        assert data["lines"] == 10

    @patch('backend_mysql.get_db')
    def test_get_leaderboard(self, mock_get_db, client, mock_db):
        """리더보드 조회 테스트"""
        mock_conn, mock_cursor = mock_db
        mock_get_db.return_value = mock_conn

        # 리더보드 데이터 모킹
        mock_cursor.fetchall.return_value = [
            {
                "email": "player1@example.com",
                "score": 5000,
                "level": 10,
                "lines": 50,
                "played_at": "2026-06-17 10:00:00"
            },
            {
                "email": "player2@example.com",
                "score": 4000,
                "level": 8,
                "lines": 40,
                "played_at": "2026-06-17 09:00:00"
            },
        ]

        response = client.get("/api/leaderboard?limit=10")

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 2
        assert data[0]["email"] == "player1@example.com"
        assert data[0]["score"] == 5000

    @patch('backend_mysql.get_db')
    def test_get_top_score_with_records(self, mock_get_db, client, mock_db):
        """기록이 있을 때 최고 점수 조회"""
        mock_conn, mock_cursor = mock_db
        mock_get_db.return_value = mock_conn

        mock_cursor.fetchone.return_value = {
            "email": "top@example.com",
            "score": 10000,
            "level": 15,
            "lines": 100,
            "played_at": "2026-06-17 10:00:00"
        }

        response = client.get("/api/top-score")

        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "top@example.com"
        assert data["score"] == 10000

    @patch('backend_mysql.get_db')
    def test_get_top_score_no_records(self, mock_get_db, client, mock_db):
        """기록이 없을 때 최고 점수 조회"""
        mock_conn, mock_cursor = mock_db
        mock_get_db.return_value = mock_conn

        mock_cursor.fetchone.return_value = None

        response = client.get("/api/top-score")

        assert response.status_code == 200
        data = response.json()
        assert "No records yet" in data["message"]

    @patch('backend_mysql.get_db')
    def test_get_my_stats(self, mock_get_db, client, mock_db):
        """사용자 통계 조회 테스트"""
        mock_conn, mock_cursor = mock_db
        mock_get_db.return_value = mock_conn

        # verify_token과 통계 모킹
        mock_cursor.fetchone.side_effect = [
            {"user_id": 1},  # verify_token
            {
                "total_games": 10,
                "best_score": 5000,
                "total_lines": 200,
                "avg_score": 3500.5
            }  # 통계 데이터
        ]

        response = client.get(
            "/api/my-stats",
            headers={"Authorization": "Bearer valid_token"}
        )

        assert response.status_code == 200
        data = response.json()
        assert data["total_games"] == 10
        assert data["best_score"] == 5000
        assert data["total_lines"] == 200
        assert data["avg_score"] == 3500.5

    @patch('backend_mysql.get_db')
    def test_get_my_stats_no_games(self, mock_get_db, client, mock_db):
        """게임 기록이 없을 때 통계 조회"""
        mock_conn, mock_cursor = mock_db
        mock_get_db.return_value = mock_conn

        # verify_token과 빈 통계 모킹
        mock_cursor.fetchone.side_effect = [
            {"user_id": 1},  # verify_token
            {
                "total_games": 0,
                "best_score": 0,
                "total_lines": 0,
                "avg_score": 0
            }  # 빈 통계
        ]

        response = client.get(
            "/api/my-stats",
            headers={"Authorization": "Bearer valid_token"}
        )

        assert response.status_code == 200
        data = response.json()
        assert data["total_games"] == 0
        assert data["best_score"] == 0
        assert data["total_lines"] == 0
        assert data["avg_score"] == 0.0

    @patch('backend_mysql.get_db')
    def test_get_my_history(self, mock_get_db, client, mock_db):
        """사용자 플레이 이력 조회 테스트"""
        mock_conn, mock_cursor = mock_db
        mock_get_db.return_value = mock_conn

        # verify_token과 이력 모킹
        mock_cursor.fetchone.return_value = {"user_id": 1}  # verify_token
        mock_cursor.fetchall.return_value = [
            {
                "id": 1,
                "score": 1000,
                "level": 5,
                "lines": 10,
                "played_at": "2026-06-17 10:00:00"
            },
            {
                "id": 2,
                "score": 2000,
                "level": 8,
                "lines": 20,
                "played_at": "2026-06-17 09:00:00"
            },
        ]

        response = client.get(
            "/api/my-history?limit=20",
            headers={"Authorization": "Bearer valid_token"}
        )

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 2
        assert data[0]["id"] == 1
        assert data[0]["score"] == 1000


class TestDatabaseOperations:
    """데이터베이스 작업 테스트"""

    @patch('backend_mysql.pymysql.connect')
    def test_get_db_returns_connection(self, mock_connect):
        """get_db가 연결을 반환하는지 테스트"""
        mock_conn = MagicMock()
        mock_connect.return_value = mock_conn

        conn = get_db()

        assert conn is mock_conn
        mock_connect.assert_called_once()

    @patch('backend_mysql.get_db')
    def test_init_db_creates_tables(self, mock_get_db):
        """init_db가 테이블을 생성하는지 테스트"""
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_conn.cursor.return_value = mock_cursor
        mock_get_db.return_value = mock_conn

        init_db()

        # 3개의 CREATE TABLE 쿼리가 실행되어야 함
        assert mock_cursor.execute.call_count == 3

        calls = [call[0][0] for call in mock_cursor.execute.call_args_list]
        assert any("CREATE TABLE IF NOT EXISTS users" in call for call in calls)
        assert any("CREATE TABLE IF NOT EXISTS sessions" in call for call in calls)
        assert any("CREATE TABLE IF NOT EXISTS game_records" in call for call in calls)

        mock_conn.commit.assert_called_once()
        mock_cursor.close.assert_called_once()
        mock_conn.close.assert_called_once()


class TestAuthorizationFlow:
    """인증 흐름 전체 테스트"""

    @patch('backend_mysql.get_db')
    def test_full_auth_flow(self, mock_get_db, client, mock_db):
        """회원가입 -> 로그인 -> 인증된 요청 전체 흐름"""
        mock_conn, mock_cursor = mock_db
        mock_get_db.return_value = mock_conn

        # 1. 회원가입
        mock_cursor.fetchone.side_effect = [None, None]  # 중복 체크, 세션
        mock_cursor.lastrowid = 1

        signup_response = client.post(
            "/api/signup",
            json={"email": "newuser@example.com", "password": "password123"}
        )
        assert signup_response.status_code == 200

        # 2. 로그인
        mock_cursor.fetchone.side_effect = [
            {"id": 1, "email": "newuser@example.com"},
            None
        ]

        login_response = client.post(
            "/api/login",
            json={"email": "newuser@example.com", "password": "password123"}
        )
        assert login_response.status_code == 200

        # 3. 인증된 요청 (게임 기록 저장)
        mock_cursor.fetchone.side_effect = [
            {"user_id": 1},  # verify_token
            {
                "id": 1,
                "score": 1000,
                "level": 5,
                "lines": 10,
                "played_at": "2026-06-17 10:00:00"
            }
        ]
        mock_cursor.lastrowid = 1

        game_response = client.post(
            "/api/game-records",
            json={"score": 1000, "level": 5, "lines": 10},
            headers={"Authorization": "Bearer valid_token"}
        )
        assert game_response.status_code == 200


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

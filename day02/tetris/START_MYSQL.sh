#!/bin/bash

echo "🎮 Starting Tetris with MySQL Backend..."
echo ""

# Docker Compose 확인
if ! command -v docker-compose &> /dev/null && ! command -v docker &> /dev/null; then
    echo "❌ Error: docker-compose is not installed"
    echo "Please install Docker and Docker Compose first"
    exit 1
fi

# .env 파일 확인
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from .env.example..."
    cp .env.example .env
    echo "✅ .env file created. Please review and update if needed."
fi

echo "📦 Starting MySQL container..."
docker-compose up -d

# MySQL 준비 대기
echo "⏳ Waiting for MySQL to be ready..."
sleep 5

# MySQL 연결 테스트
until docker-compose exec mysql mysqladmin ping -h"localhost" --silent; do
    echo "⏳ Waiting for MySQL..."
    sleep 2
done

echo "✅ MySQL is ready!"
echo ""

# 백엔드 시작
echo "🚀 Starting backend server (port 8001)..."
python3 backend_mysql.py > backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

# 백엔드 시작 대기
sleep 2

# 프론트엔드 시작
echo "🌐 Starting frontend server (port 8080)..."
echo ""
echo "=================================="
echo "✨ Tetris is now running!"
echo "=================================="
echo ""
echo "🎮 Game: http://localhost:8080"
echo "📊 Leaderboard: http://localhost:8080/leaderboard.html"
echo "📚 API Docs: http://localhost:8001/docs"
echo "🗄️  Database: MySQL (Docker)"
echo ""
echo "To stop the servers:"
echo "  - Frontend: Ctrl+C"
echo "  - Backend: kill $BACKEND_PID"
echo "  - MySQL: docker-compose down"
echo ""
echo "To view backend logs:"
echo "  tail -f backend.log"
echo ""

python3 -m http.server 8080

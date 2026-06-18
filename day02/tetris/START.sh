#!/bin/bash

echo "🎮 Tetris 풀스택 애플리케이션 시작"
echo "=================================="

# 백엔드 서버 시작
echo "📡 백엔드 서버 시작 중... (포트 8001)"
python3 backend.py > backend.log 2>&1 &
BACKEND_PID=$!
sleep 2

# 백엔드 서버 확인
if curl -s http://localhost:8001/ > /dev/null; then
    echo "✅ 백엔드 서버 실행 중 (PID: $BACKEND_PID)"
else
    echo "❌ 백엔드 서버 시작 실패"
    exit 1
fi

# 프론트엔드 서버 시작
echo "🌐 프론트엔드 서버 시작 중... (포트 8080)"
python3 -m http.server 8080 > frontend.log 2>&1 &
FRONTEND_PID=$!
sleep 1

echo ""
echo "✅ 서버가 성공적으로 시작되었습니다!"
echo "=================================="
echo "🎮 게임 시작: http://localhost:8080"
echo "📊 API 문서: http://localhost:8001/docs"
echo ""
echo "종료하려면 Ctrl+C를 누르세요"
echo ""

# 프론트엔드 서버를 포그라운드로 유지
wait $FRONTEND_PID

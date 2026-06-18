# Todo List 앱 제작 계획

## 📋 파일 구조
```
todo/
├── index.html      (구조)
├── style.css       (스타일)
└── script.js       (기능)
```

## 🎯 구현 계획

### 1. **index.html** - UI 구조
- 제목 (h1)
- 입력창 (input) + 추가 버튼 (button)
- 할 일 목록 컨테이너 (ul)

### 2. **style.css** - 디자인
- 전체 레이아웃: 중앙 정렬된 카드 형태
- 그라데이션 배경
- 할 일 항목: 체크박스, 텍스트, 삭제 버튼 가로 배치
- 완료된 항목: 취소선 + 투명도 처리
- 호버 효과 및 반응형

### 3. **script.js** - 핵심 기능
```
[데이터 관리]
- todos 배열: {text, completed, id} 객체들

[주요 함수]
- loadTodos(): 페이지 로드 시 localStorage에서 불러오기
- saveTodos(): 변경사항 localStorage에 저장
- renderTodos(): todos 배열을 화면에 그리기
- addTodo(): 새 할 일 추가
- toggleTodo(index): 체크박스 토글
- deleteTodo(index): 삭제 (확인 후)

[이벤트]
- 추가 버튼 클릭
- Enter 키 입력
```

### 4. **로컬스토리지 구조**
```json
{
  "todos": [
    {"text": "장보기", "completed": false, "id": 1718640000000},
    {"text": "운동하기", "completed": true, "id": 1718640100000}
  ]
}
```

## ✅ 구현 순서
1. index.html - 기본 구조 작성
2. style.css - 스타일링
3. script.js - 기능 구현 및 로컬스토리지 연동

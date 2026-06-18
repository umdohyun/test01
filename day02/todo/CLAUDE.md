# Todo List 프로젝트

## 프로젝트 개요
HTML, CSS, JavaScript를 사용한 Todo List 웹 애플리케이션입니다.

## 기술 스택
- HTML5
- CSS3 (Material Design)
- Vanilla JavaScript
- LocalStorage / Supabase (Backend)

## 주요 기능
- 할 일 추가/완료/삭제
- 우선순위 설정 (높음/중간/낮음)
- 우선순위별 자동 정렬
- 로컬스토리지 자동 저장
- 반응형 디자인 (데스크톱/태블릿/모바일)

## Git 워크플로우 규칙
- **Merge 사용**: commit 시 rebase가 아닌 merge를 사용해주세요
- **작업 범위**: git 명령 사용 시 이 디렉토리(`/src/exercise/umdohy/day02/todo`) 이하의 파일들만 다루고, 다른 디렉토리는 읽지 않습니다

## 파일 구조
```
todo/
├── index.html          # 메인 HTML 구조
├── style.css           # Material Design 스타일
├── script.js           # Todo 로직 및 이벤트 처리
├── PLAN.md            # 프로젝트 계획서
└── CLAUDE.md          # 프로젝트 가이드 (이 파일)
```

## 개발 서버 실행
```bash
python3 -m http.server 8000
```
브라우저에서 `http://localhost:8000/index.html` 접속

## 디자인 가이드
- **색상 테마**: 파스텔톤 (핑크-블루 그라데이션)
- **폰트**: Roboto (Material Design)
- **아이콘**: Material Icons
- **반응형 브레이크포인트**:
  - 모바일: ~480px
  - 태블릿: 481-768px
  - 데스크톱: 769px~

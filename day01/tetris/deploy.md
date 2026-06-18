# Tetris - 실행 방법

## 방법 1: 파일 직접 열기 (가장 간단)

별도 설치 없이 `index.html` 파일을 브라우저에서 바로 열면 됩니다.

```
tetris/index.html  →  더블클릭 또는 브라우저로 드래그
```

> Chrome, Firefox, Edge, Safari 모두 지원합니다.

---

## 방법 2: 로컬 웹 서버로 실행 (권장)

일부 브라우저에서 `file://` 프로토콜로 열 때 보안 제한이 생길 수 있습니다.
로컬 서버를 사용하면 이를 방지할 수 있습니다.

### Python (설치 여부 확인: `python --version`)

```bash
cd tetris/
python -m http.server 8080
```

브라우저에서 접속: `http://localhost:8080`

### Node.js (`npx` 사용, Node.js 설치 필요)

```bash
cd tetris/
npx serve .
```

브라우저에서 접속: 터미널에 출력된 주소 (기본 `http://localhost:3000`)

### VS Code Live Server 확장

1. VS Code에서 `index.html` 파일 열기
2. 오른쪽 하단 **Go Live** 버튼 클릭
3. 브라우저가 자동으로 열림

---

## 파일 구조

```
tetris/
├── index.html   — 랜딩 페이지 (이 파일을 브라우저로 열면 됨)
├── game.html    — 게임 페이지 (index.html에서 이동)
├── style.css    — 스타일
├── game.js      — 게임 로직
├── plan.md      — 구현 계획
└── deploy.md    — 이 파일
```

## 조작법

| 키 | 동작 |
|----|------|
| `←` `→` | 블록 좌우 이동 |
| `↑` | 블록 회전 |
| `↓` | 빠른 낙하 |
| `Space` | 즉시 낙하 |
| `P` | 일시정지 / 재개 |

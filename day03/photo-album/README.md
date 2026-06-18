# 📸 Photo Album - 날짜별 사진 앨범

날짜별로 자동 그룹화되는 사진 앨범 애플리케이션입니다. Supabase Storage를 활용한 실제 이미지 파일 업로드를 지원합니다.

## ✨ 주요 기능

### 📅 날짜별 자동 그룹화
- 업로드한 사진을 날짜별로 자동 분류
- 각 앨범은 해당 날짜의 모든 사진 포함
- 날짜별 앨범 타일 표시

### 🖱️ 드래그 앤 드롭 재배치
- 앨범을 드래그하여 원하는 순서로 배치
- 순서는 자동으로 저장됨
- 다음 접속 시에도 순서 유지

### 📷 타일형 미리보기 UI
- 앨범당 최대 4장의 사진 미리보기
- 그리드 형태의 타일 레이아웃
- 사진 개수 표시

### 🚫 사진 중복 방지
- 한 사진은 하나의 앨범에만 속함
- 업로드 날짜로 자동 분류
- 앨범 간 중복 불가

### 🔐 개인 저장소
- 각 사용자의 사진은 독립적으로 관리
- Supabase RLS로 보안 보장
- 다른 사용자 접근 불가

## 🛠️ 기술 스택

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Authentication**: Supabase Auth (Kanban 공유)
- **Storage**: Supabase Storage (이미지 파일)
- **Database**: Supabase PostgreSQL
- **Hosting**: GitHub Pages (예정)

## 📦 설치 및 실행

### 1. 기본 설정 (Kanban과 동일)

인증은 Kanban 앱과 동일한 Supabase 프로젝트를 사용합니다.

```bash
# config.js는 이미 설정됨
# auth.js는 Kanban에서 복사됨
```

### 2. 데이터베이스 마이그레이션

**Supabase Dashboard > SQL Editor**에서 `migration.sql` 실행:

```sql
-- photos 테이블 생성
-- user_settings 테이블 생성
-- RLS 정책 설정
-- Storage 정책 설정
```

### 3. Storage Bucket 생성

**중요: 수동으로 생성해야 함!**

1. **Supabase Dashboard > Storage**
2. **"New bucket" 클릭**
3. 설정:
   - Name: `photos`
   - Public bucket: ✅ 체크
4. **Create bucket 클릭**

### 4. 로컬 실행

```bash
cd /path/to/photo-album
python3 -m http.server 8000

# 브라우저 접속
# http://localhost:8000
```

## 📁 파일 구조

```
photo-album/
├── index.html          # 메인 앨범 페이지
├── style.css           # 전체 스타일
├── script.js           # 앨범 로직
├── storage.js          # Supabase Storage API
├── auth.js             # 인증 모듈 (Kanban 공유)
├── config.js           # Supabase 자격증명 (Kanban 공유)
├── migration.sql       # 데이터베이스 스키마
└── README.md           # 이 문서
```

## 🎨 UI 구조

### 메인 페이지
```
┌─────────────────────────────────┐
│  📸 Photo Album    [로그아웃]    │
├─────────────────────────────────┤
│  [📁 사진 업로드]                │
├─────────────────────────────────┤
│  ┌─────┐ ┌─────┐ ┌─────┐       │
│  │2024 │ │2024 │ │2024 │       │
│  │06-18│ │06-17│ │06-16│       │
│  │ 🖼️🖼️ │ │ 🖼️🖼️ │ │ 🖼️🖼️ │       │
│  │ 🖼️🖼️ │ │ 🖼️🖼️ │ │ 🖼️🖼️ │       │
│  │12장 │ │8장  │ │5장  │       │
│  └─────┘ └─────┘ └─────┘       │
└─────────────────────────────────┘
```

### 앨범 상세 (모달)
```
┌─────────────────────────────────┐
│  2024년 06월 18일          [×]  │
├─────────────────────────────────┤
│  🖼️ 🖼️ 🖼️ 🖼️ 🖼️               │
│  🖼️ 🖼️ 🖼️ 🖼️ 🖼️               │
│  🖼️ 🖼️                         │
└─────────────────────────────────┘
```

### 사진 뷰어 (모달)
```
┌─────────────────────────────────┐
│                          [×]     │
│         ‹   🖼️ 큰 이미지   ›     │
│                                  │
│  2024-06-18 14:30  [삭제]       │
└─────────────────────────────────┘
```

## 🔐 보안

### Row Level Security (RLS)
- 사용자는 본인의 사진만 CRUD 가능
- Storage도 사용자 폴더별로 격리
- SQL 인젝션 자동 방어

### Storage 구조
```
photos/
├── {user_id_1}/
│   ├── 1718697600000_abc123.jpg
│   └── 1718697601000_def456.png
└── {user_id_2}/
    └── 1718697602000_ghi789.jpg
```

## 📊 데이터 구조

### photos 테이블
```sql
id            UUID        (Primary Key)
user_id       UUID        (Foreign Key → auth.users)
file_path     TEXT        (Storage 경로)
url           TEXT        (Public URL)
file_size     INTEGER     (바이트)
mime_type     VARCHAR(100)
original_name TEXT
created_at    TIMESTAMP
```

### user_settings 테이블
```sql
id            UUID        (Primary Key)
user_id       UUID        (Foreign Key → auth.users)
album_order   JSONB       (날짜 배열)
created_at    TIMESTAMP
```

## 🚀 사용 방법

### 1. 로그인
- Kanban 앱과 동일한 계정 사용
- 이메일 또는 GitHub OAuth

### 2. 사진 업로드
1. **[📁 사진 업로드]** 버튼 클릭
2. 여러 장 선택 가능
3. 자동으로 날짜별 앨범 생성

### 3. 앨범 재배치
1. 앨범 카드를 **드래그**
2. 원하는 위치에 **드롭**
3. 순서 자동 저장

### 4. 앨범 보기
1. 앨범 카드 **클릭**
2. 타일형 사진 목록 표시
3. 사진 클릭 → 전체 화면 뷰어

### 5. 사진 삭제
1. 사진 뷰어에서 **[삭제]** 버튼
2. 확인 메시지
3. Storage + DB에서 모두 삭제

## 🐛 트러블슈팅

### 1. "photos" bucket does not exist

**원인**: Storage 버킷 미생성

**해결**:
1. Supabase Dashboard > Storage
2. "New bucket" 클릭
3. Name: `photos`, Public: ✅
4. Create

### 2. 업로드 실패

**원인 1**: 파일 크기 초과 (10MB 제한)
**원인 2**: RLS 정책 미적용

**해결**:
- `migration.sql` 재실행
- Storage 정책 확인

### 3. 사진이 안보임

**원인**: Public bucket 미설정

**해결**:
1. Supabase Dashboard > Storage > photos
2. Settings 클릭
3. Public bucket: ✅ 체크

## 📝 TODO / 향후 계획

### v1.0 (현재)
- ✅ 날짜별 자동 그룹화
- ✅ 드래그 앤 드롭 재배치
- ✅ 타일형 미리보기
- ✅ 사진 업로드/삭제
- ✅ 전체 화면 뷰어

### v1.1 (계획)
- ⏳ 앨범 제목 수정
- ⏳ 사진 다운로드
- ⏳ 공유 링크 생성
- ⏳ 검색 기능

### v2.0 (계획)
- ⏳ 태그 기능
- ⏳ 즐겨찾기
- ⏳ 슬라이드쇼
- ⏳ 이미지 편집 (회전, 크롭)

## 👤 Author

**Dohyun Um**
- GitHub: [@umdohyun](https://github.com/umdohyun)

## 🙏 Acknowledgments

- [Supabase](https://supabase.com) - Backend & Storage
- Kanban 앱과 인증 공유
- Claude Sonnet 4.5 - Development assistance

---

**개발일**: 2026-06-18  
**관련 프로젝트**: [Kanban Board](../kanban/)

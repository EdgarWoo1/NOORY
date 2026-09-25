# 누리일주 (NOORY)

세계일주를 꿈꾸는 20대 청년의 여행기·독후감·에세이 블로그. 기존 정적 HTML 사이트를
React(Vite)로 재구축한 버전. 이 저장소의 유일한 문서 파일이며, 프로젝트 설명과
작업 규칙을 함께 관리한다.

## 기능
- 기존 글(여행기 8 + 일기/독후감 49 = 57개)을 데이터로 이전하여 그대로 표시
- 통합 **검색** (기존 글 + 새 글)
- 관리자 **로그인** (Supabase Auth)
- 관리자 전용 **글 작성/수정/삭제** (새 글은 Supabase `_TdaPost`에 저장)
- **문의하기** 폼 (Supabase `_TdaContact` 저장, 미설정 시 메일 앱으로 연결)
- **댓글** (Supabase `_TdaComment`)

## 기술 스택
React 19 · React Router 7 · Vite · Supabase · 기존 Bootstrap 4.5.3 테마(녹색)

## 로컬 실행 (Node.js 필요)
```bash
npm install
npm run dev
```

## 배포
main 브랜치 푸시 → **Vercel 자동 배포**. 별도 배포 명령은 없다.
저장소 쪽에서 배포 성공 여부를 확인할 수단이 없으므로, 푸시 후에는 사용자에게
사이트 확인을 안내한다.

---

# 데이터 구조

글이 **두 갈래**로 존재한다. 혼동하지 말 것.

| | 위치 | 내용 | 반영 방법 |
|---|---|---|---|
| 정적 JSON | `src/data/posts.json` | 기존 글 57개 | 깃 푸시 → Vercel 재배포 |
| Supabase | `_TdaPost` 테이블 | 사이트에서 관리자로 로그인해 새로 쓴 글 | 즉시 반영 |

아래 인용문 추가 작업은 **전부 정적 JSON** 쪽이다.

### Supabase
- 프로젝트 ref `pfrthfieouyqacsjkbvd` · 대시보드 https://supabase.com/dashboard/project/pfrthfieouyqacsjkbvd
- 설정값은 `src/config.js` (anon 키는 공개돼도 되는 키, 데이터는 RLS로 보호)
- 스키마·정책은 `supabase-setup.sql`
- 테이블: `_TdaPost`(글) / `_TdaContact`(문의) / `_TdaComment`(댓글)

### 초기 설정 (이미 완료됨 — 재구축할 때만 참고)
1. Supabase 새 프로젝트 생성 → Project URL, anon key를 `src/config.js`에 입력
2. Supabase **SQL Editor**에서 `supabase-setup.sql` 실행 (테이블·정책 생성)
3. **Authentication → Users**에서 관리자 계정 추가(Auto Confirm), 가입(Sign up) 차단
4. GitHub에 push → Vercel에서 import → 자동 배포

### 서버리스 함수 (`api/`, Vercel)
앱은 SPA지만 아래 두 경로는 Vercel 함수가 먼저 받는다(`vercel.json` rewrites).
- `/post/:slug` → `api/post.js` — 빌드된 `index.html`에 **글별 title·description·og:image**를
  박아서 돌려준다. 카톡·네이버 링크 미리보기 봇이 JS를 실행하지 않기 때문. 화면은 그대로 SPA.
- `/sitemap.xml` → `api/sitemap.js` — 정적 글 + Supabase 글로 **요청 시점에 생성**. 글을
  추가해도 사이트맵을 손댈 필요 없다. (`public/sitemap.xml`을 다시 만들면 함수보다 우선하므로 두지 말 것)
- 공용 조회 로직은 `api/_posts.js`. slug는 NFD/NFC가 섞여 있으니 URL에는 **저장된 형태 그대로** 쓴다.
- 로컬 `npm run dev`에서는 이 함수들이 돌지 않는다(배포 환경에서만 동작).

### 데이터 재생성
기존 HTML에서 글 데이터를 다시 뽑으려면 `extract.py` 참고. 결과물은 `src/data/posts.json`.

---

# 독후감 인용문 추가 워크플로 (기본 요청)

사용자가 **책 본문 문장 + 페이지 번호**만 던지면(예: `"...문장... 91p`), 확인 질문 없이
아래 순서를 끝까지 수행한다. 여러 문장을 `/`로 구분해 한 번에 주는 경우도 있다.

1. **오탈자 검토** — 맞춤법·띄어쓰기·쉼표 뒤 공백·조사 오류를 알아서 고친다.
   - 확신이 있는 것은 그냥 고치고, 작업 후 **무엇을 어떻게 고쳤는지 목록으로 보고**한다.
   - 원문이 무엇이었는지 애매한 경우(단어 자체가 뭉개진 경우 등)는 가장 가까운 형태로
     고치되 **불확실하다고 명시**해서 사용자가 책으로 확인할 수 있게 한다.
   - 저자 문체로 보이는 문장 파편(`~하는 사람이.` 처럼 앞 문장에서 이어지는 형태)은
     오타가 아니므로 그대로 둔다.
2. **데이터 반영** — `src/data/posts.json`의 해당 글에 인용 블록을 추가한다. (아래 포맷)
3. **커밋 + 푸시** — 별도 확인 없이 바로 `git push origin main`.
4. **배포** — 푸시가 곧 배포. 사용자에게 사이트 확인을 안내한다.

### 하지 말 것
- 책 페이지 내용을 **추측해서 채우지 않는다.** 책 본문은 검색으로 확인할 수 없고,
  인터넷 인용문은 판본별 페이지가 다르다. 문장은 사용자가 주는 것만 쓴다.
- 게시글의 `date` / `dateLabel`은 요청 없이 바꾸지 않는다.
- `tag`는 요청이 있을 때만 수정한다.

## 인용 블록 포맷

`posts.json`은 `json.dumps(posts, ensure_ascii=False, indent=1) + "\n"`으로 다시 쓰면
기존 포맷과 정확히 일치한다(라운드트립 검증됨). 파이썬으로 로드→수정→저장이 안전하다.

`bodyHtml` 맨 끝에 다음 블록을 덧붙인다:

```html
<div style="border-left: 4px solid {COLOR}; padding: 16px 20px; margin-bottom: 28px; background: #fafafa;">
<p style="font-family: 'Nanum Myeongjo', serif; font-size: 16px; line-height: 2; margin-bottom: 8px;">
{문장}
</p>
<p style="text-align: right; color: #aaa; font-size: 12px; margin: 0;">p. {페이지}</p>
</div>
```

- **테두리 색은 6색 순환**: `#FFE400` → `#b0c4de` → `#e08080` → `#90c090` → `#c9a96e` → `#9b8cce` → (반복).
  마지막 블록의 색을 확인하고 그 다음 색을 쓴다.
- **`text` 필드에도 같은 문장 + `p. {페이지}`를 공백으로 이어 붙인다.** 통합 검색이
  `text`를 보기 때문에 빠뜨리면 검색에 안 걸린다.
- 커밋 메시지: `'{책 제목}' 글에 인용문 추가 ({N}p)` / 여러 개면 `인용문 2개 추가 (101p, 102p)`

### 현재 작업 중인 글
- `[독후감] 평일도 인생이니까` — slug `etc_62_평일도인생이니까`, `posts.json` index 65

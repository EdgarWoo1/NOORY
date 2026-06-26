# 누리일주 (NOORY) — React

세계일주를 꿈꾸는 20대 청년의 여행기·일기·독후감 블로그. 기존 정적 HTML 사이트를
React(Vite)로 재구축한 버전입니다.

## 기능
- 기존 글(여행기 8 + 일기/독후감 49 = 57개)을 데이터로 이전하여 그대로 표시
- 통합 **검색** (기존 글 + 새 글)
- 관리자 **로그인** (Supabase Auth)
- 관리자 전용 **글 작성/수정/삭제** (새 글은 Supabase `_TdaPost`에 저장)
- **문의하기** 폼 (Supabase `_TdaContact` 저장, 미설정 시 메일 앱으로 연결)

## 기술 스택
React 19 · React Router 7 · Vite · Supabase · 기존 Bootstrap 4.5.3 테마(녹색)

## 로컬 실행 (Node.js 필요)
```bash
npm install
npm run dev
```

## 설정 (배포 전 한 번)
1. **Supabase 새 프로젝트** 생성 → Project URL, anon key를 `src/config.js`에 입력
2. Supabase **SQL Editor**에서 `supabase-setup.sql` 실행 (테이블·정책 생성)
3. **Authentication → Users**에서 관리자 계정 추가(Auto Confirm), 가입(Sign up) 차단
4. GitHub에 push → Vercel에서 import → 자동 배포

## 데이터 재생성
기존 HTML에서 글 데이터를 다시 뽑으려면 `extract.py`(스크립트) 참고.
결과물은 `src/data/posts.json`.

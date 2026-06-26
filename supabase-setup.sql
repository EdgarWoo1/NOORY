-- ============================================================
--  누리일주(NOORY) Supabase 초기 설정  ―  한 번만 실행
-- ============================================================
--  실행: Supabase 대시보드 → SQL Editor → New query → 붙여넣고 Run
--
--  명명 규칙: 테이블 = _ + PascalCase, 컬럼 = PascalCase
--  대문자 섞인 이름은 PostgreSQL에서 "큰따옴표"로 감싼다.
-- ============================================================

-- ---------- 1) 게시글 테이블 _TdaPost ----------
create table if not exists public."_TdaPost" (
  "No"        bigint generated always as identity primary key,
  "Slug"      text unique not null,
  "Title"     text not null,
  "Category"  text not null default '일기',   -- '여행기' 또는 '일기'
  "Tag"       text not null default '',
  "Date"      date not null default current_date,
  "Thumb"     text not null default '',        -- 대표 이미지 주소(선택)
  "Body"      text not null,
  "CreatedAt" timestamptz not null default now()
);

create index if not exists "_TdaPost_Date_idx" on public."_TdaPost" ("Date" desc);

alter table public."_TdaPost" enable row level security;

drop policy if exists "_TdaPost read"   on public."_TdaPost";
drop policy if exists "_TdaPost insert" on public."_TdaPost";
drop policy if exists "_TdaPost update" on public."_TdaPost";
drop policy if exists "_TdaPost delete" on public."_TdaPost";

-- 읽기: 누구나 / 쓰기·수정·삭제: 로그인한 관리자만
create policy "_TdaPost read"   on public."_TdaPost" for select using (true);
create policy "_TdaPost insert" on public."_TdaPost" for insert to authenticated with check (true);
create policy "_TdaPost update" on public."_TdaPost" for update to authenticated using (true) with check (true);
create policy "_TdaPost delete" on public."_TdaPost" for delete to authenticated using (true);


-- ---------- 2) 문의 테이블 _TdaContact ----------
create table if not exists public."_TdaContact" (
  "No"        bigint generated always as identity primary key,
  "Name"      text not null,
  "Email"     text not null default '',
  "Message"   text not null,
  "CreatedAt" timestamptz not null default now()
);

alter table public."_TdaContact" enable row level security;

drop policy if exists "_TdaContact insert" on public."_TdaContact";
drop policy if exists "_TdaContact read"   on public."_TdaContact";

-- 문의 등록: 누구나 / 읽기: 로그인한 관리자만(대시보드에서 확인)
create policy "_TdaContact insert" on public."_TdaContact" for insert with check (true);
create policy "_TdaContact read"   on public."_TdaContact" for select to authenticated using (true);

-- ============================================================
--  3) 관리자 계정 만들기 (SQL 아님 — 대시보드에서)
--     Authentication → Users → Add user → 이메일/비밀번호 입력,
--     "Auto Confirm User" 체크 후 저장.
--  4) 외부 가입 차단
--     Authentication → Sign In / Providers → "Allow new users to
--     sign up" 끄기  (관리자 외 계정 생성 불가)
-- ============================================================

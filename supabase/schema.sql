-- ============================================================================
-- EDUWELL | 교육복지 통합업무관리시스템 - 초기 스키마
-- Supabase SQL Editor에서 전체 실행하세요 (Project > SQL Editor > New query)
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- profiles: 담당 교육복지사 (auth.users 1:1)
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  org_name text,
  role text not null default 'staff' check (role in ('staff', 'admin')),
  phone text,
  created_at timestamptz not null default now()
);

-- 신규 가입 시 profiles 자동 생성
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      split_part(new.email, '@', 1)
    )
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ----------------------------------------------------------------------------
-- students: 학생
-- ----------------------------------------------------------------------------
create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  school text,
  grade int,
  class_no int,
  student_no int,
  gender text check (gender in ('M', 'F')),
  birth_date date,
  contact text,
  guardian_name text,
  guardian_contact text,
  address text,
  priority_type text, -- 우선지원대상 사유: 기초생활수급/한부모/차상위/다문화/탈북/기타
  status text not null default 'active' check (status in ('active', 'monitoring', 'closed', 'transferred')),
  memo text,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists students_name_idx on public.students (name);
create index if not exists students_status_idx on public.students (status);

-- ----------------------------------------------------------------------------
-- counseling_logs: 상담일지
-- ----------------------------------------------------------------------------
create table if not exists public.counseling_logs (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references public.students (id) on delete set null,
  counselor_id uuid references public.profiles (id),
  log_date date not null default current_date,
  start_time time,
  category text not null default 'counseling' check (
    category in ('counseling', 'education', 'referral', 'home_visit', 'phone', 'group', 'other')
  ), -- 상담/교육/의뢰/가정방문/전화상담/집단상담/기타
  title text,
  content text,
  action_taken text,
  next_plan text,
  is_completed boolean not null default false, -- 작성 완료 여부 (미작성 상담일지 위젯용)
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists counseling_logs_student_idx on public.counseling_logs (student_id);
create index if not exists counseling_logs_date_idx on public.counseling_logs (log_date);
create index if not exists counseling_logs_completed_idx on public.counseling_logs (is_completed);

-- ----------------------------------------------------------------------------
-- cases: 사례관리
-- ----------------------------------------------------------------------------
create table if not exists public.cases (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students (id) on delete cascade,
  case_manager_id uuid references public.profiles (id),
  title text not null,
  background text,
  goal text,
  risk_level text not null default 'medium' check (risk_level in ('low', 'medium', 'high')),
  status text not null default 'open' check (status in ('open', 'monitoring', 'closed')),
  opened_at date not null default current_date,
  closed_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists cases_student_idx on public.cases (student_id);
create index if not exists cases_status_idx on public.cases (status);
create index if not exists cases_risk_idx on public.cases (risk_level);

-- ----------------------------------------------------------------------------
-- case_notes: 사례관리 진행기록 (타임라인)
-- ----------------------------------------------------------------------------
create table if not exists public.case_notes (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases (id) on delete cascade,
  author_id uuid references public.profiles (id),
  note_date date not null default current_date,
  note_type text not null default 'progress' check (
    note_type in ('progress', 'case_meeting', 'referral', 'crisis', 'closing')
  ), -- 진행기록/사례회의/자원연계/위기개입/종결
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists case_notes_case_idx on public.case_notes (case_id);

-- ----------------------------------------------------------------------------
-- resources: 지역 자원(기관) DB
-- ----------------------------------------------------------------------------
create table if not exists public.resources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null, -- 복지관/정신건강복지센터/청소년상담복지센터/지자체/병원/법률/기타
  contact_person text,
  phone text,
  address text,
  memo text,
  created_at timestamptz not null default now()
);

create index if not exists resources_category_idx on public.resources (category);

-- ----------------------------------------------------------------------------
-- referrals: 학생-자원 연계 이력
-- ----------------------------------------------------------------------------
create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students (id) on delete cascade,
  case_id uuid references public.cases (id) on delete set null,
  resource_id uuid not null references public.resources (id),
  purpose text,
  status text not null default 'requested' check (
    status in ('requested', 'in_progress', 'approved', 'rejected', 'closed')
  ), -- 신청/진행중/승인/반려/종결
  request_date date not null default current_date,
  result text,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists referrals_student_idx on public.referrals (student_id);
create index if not exists referrals_status_idx on public.referrals (status);

-- ----------------------------------------------------------------------------
-- programs: 프로그램(방과후/문화체험/멘토링 등)
-- ----------------------------------------------------------------------------
create table if not exists public.programs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null default 'other' check (
    category in ('afterschool', 'experience', 'mentoring', 'career', 'psychological', 'other')
  ),
  start_date date,
  end_date date,
  location text,
  capacity int,
  budget numeric,
  description text,
  status text not null default 'planned' check (status in ('planned', 'ongoing', 'completed', 'canceled')),
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now()
);

create index if not exists programs_status_idx on public.programs (status);

-- ----------------------------------------------------------------------------
-- program_participants: 프로그램 참여 학생
-- ----------------------------------------------------------------------------
create table if not exists public.program_participants (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.programs (id) on delete cascade,
  student_id uuid not null references public.students (id) on delete cascade,
  applied_at date not null default current_date,
  satisfaction_score numeric,
  memo text,
  unique (program_id, student_id)
);

create index if not exists program_participants_program_idx on public.program_participants (program_id);
create index if not exists program_participants_student_idx on public.program_participants (student_id);

-- ----------------------------------------------------------------------------
-- program_sessions: 프로그램 회차
-- ----------------------------------------------------------------------------
create table if not exists public.program_sessions (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.programs (id) on delete cascade,
  session_date date not null,
  topic text,
  created_at timestamptz not null default now()
);

create index if not exists program_sessions_program_idx on public.program_sessions (program_id);

-- ----------------------------------------------------------------------------
-- attendance: 회차별 출석
-- ----------------------------------------------------------------------------
create table if not exists public.attendance (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.program_sessions (id) on delete cascade,
  student_id uuid not null references public.students (id) on delete cascade,
  attended boolean not null default true,
  memo text,
  unique (session_id, student_id)
);

create index if not exists attendance_session_idx on public.attendance (session_id);

-- ----------------------------------------------------------------------------
-- schedules: 일정
-- ----------------------------------------------------------------------------
create table if not exists public.schedules (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null default 'etc' check (
    category in ('counseling', 'case_meeting', 'program', 'education', 'home_visit', 'etc')
  ),
  schedule_date date not null,
  start_time time,
  end_time time,
  student_id uuid references public.students (id) on delete set null,
  case_id uuid references public.cases (id) on delete set null,
  program_id uuid references public.programs (id) on delete set null,
  location text,
  memo text,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now()
);

create index if not exists schedules_date_idx on public.schedules (schedule_date);

-- ----------------------------------------------------------------------------
-- notices: 공지사항 (홈 대시보드용)
-- ----------------------------------------------------------------------------
create table if not exists public.notices (
  id uuid primary key default gen_random_uuid(),
  category text not null default 'notice' check (category in ('notice', 'update')),
  title text not null,
  content text,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- memos: 개인 메모 (홈 대시보드 위젯)
-- ----------------------------------------------------------------------------
create table if not exists public.memos (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles (id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists memos_author_idx on public.memos (author_id);

-- ============================================================================
-- updated_at 자동 갱신 트리거
-- ============================================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare t text;
begin
  foreach t in array array['students', 'counseling_logs', 'cases', 'referrals'] loop
    execute format(
      'drop trigger if exists set_updated_at on public.%I; create trigger set_updated_at before update on public.%I for each row execute procedure public.set_updated_at();',
      t, t
    );
  end loop;
end $$;

-- ============================================================================
-- Row Level Security: 로그인한 담당자(내부 직원)는 전체 접근 가능,
-- 비로그인 사용자는 접근 불가 (내부 업무관리 시스템 기준)
-- ============================================================================
alter table public.profiles enable row level security;
alter table public.students enable row level security;
alter table public.counseling_logs enable row level security;
alter table public.cases enable row level security;
alter table public.case_notes enable row level security;
alter table public.resources enable row level security;
alter table public.referrals enable row level security;
alter table public.programs enable row level security;
alter table public.program_participants enable row level security;
alter table public.program_sessions enable row level security;
alter table public.attendance enable row level security;
alter table public.schedules enable row level security;
alter table public.notices enable row level security;
alter table public.memos enable row level security;

create policy "profiles_select_own_or_all" on public.profiles for select to authenticated using (true);
create policy "profiles_update_own" on public.profiles for update to authenticated using (id = auth.uid());

do $$
declare t text;
begin
  foreach t in array array[
    'students', 'counseling_logs', 'cases', 'case_notes', 'resources',
    'referrals', 'programs', 'program_participants', 'program_sessions',
    'attendance', 'schedules', 'notices'
  ] loop
    execute format('create policy "%I_all_authenticated" on public.%I for all to authenticated using (true) with check (true);', t, t);
  end loop;
end $$;

create policy "memos_own_only" on public.memos for all to authenticated
  using (author_id = auth.uid()) with check (author_id = auth.uid());

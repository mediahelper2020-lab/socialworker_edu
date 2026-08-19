-- ============================================================================
-- EDUWELL | Google OAuth 전환에 따른 profiles 트리거 업데이트
-- 이미 supabase/schema.sql을 실행한 프로젝트라면 이 파일만 SQL Editor에서
-- 추가로 실행하면 됩니다 (전체 schema.sql을 다시 실행할 필요 없음).
-- ============================================================================

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

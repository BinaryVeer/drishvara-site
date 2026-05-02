-- Controlled RLS lockdown helper.
-- Use only when intentionally enabling RLS on all public schema tables.
-- This does not create policies and does not delete data.

do $$
declare
  r record;
begin
  for r in
    select tablename
    from pg_tables
    where schemaname = 'public'
      and rowsecurity = false
  loop
    execute format('alter table public.%I enable row level security;', r.tablename);
  end loop;
end $$;

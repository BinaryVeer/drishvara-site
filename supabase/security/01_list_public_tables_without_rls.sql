-- Lists public schema tables where RLS is disabled.
-- Expected after lockdown: 0 rows.

select
  schemaname,
  tablename,
  rowsecurity
from pg_tables
where schemaname = 'public'
  and rowsecurity = false
order by tablename;

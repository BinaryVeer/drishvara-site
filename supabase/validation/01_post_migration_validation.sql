-- Drishvara Activation Stage 01B
-- Post-migration validation SQL pack
-- Run this AFTER applying: supabase/migrations/20260430_b20a_subscriber_backend_schema.sql

-- 1. Table existence check
select
  table_schema,
  table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in (
    'subscriber_profiles',
    'subscriptions',
    'subscriber_daily_guidance',
    'user_submissions',
    'feedback_submissions',
    'palmistry_requests',
    'knowledge_update_reviews'
  )
order by table_name;

-- Expected: 7 rows.

-- 2. RLS enabled check
select
  schemaname,
  tablename,
  rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in (
    'subscriber_profiles',
    'subscriptions',
    'subscriber_daily_guidance',
    'user_submissions',
    'feedback_submissions',
    'palmistry_requests',
    'knowledge_update_reviews'
  )
order by tablename;

-- Expected: rowsecurity = true for all 7 tables.

-- 3. Policy existence check
select
  schemaname,
  tablename,
  policyname,
  cmd
from pg_policies
where schemaname = 'public'
  and tablename in (
    'subscriber_profiles',
    'subscriptions',
    'subscriber_daily_guidance',
    'user_submissions',
    'feedback_submissions',
    'palmistry_requests',
    'knowledge_update_reviews'
  )
order by tablename, policyname;

-- Expected: owner-scoped policies exist for user-facing tables.

-- 4. Trigger existence check
select
  event_object_table as table_name,
  trigger_name,
  action_timing,
  event_manipulation
from information_schema.triggers
where trigger_schema = 'public'
  and event_object_table in (
    'subscriber_profiles',
    'subscriptions',
    'subscriber_daily_guidance',
    'user_submissions',
    'feedback_submissions',
    'palmistry_requests',
    'knowledge_update_reviews'
  )
order by event_object_table, trigger_name;

-- Expected: updated_at triggers exist.

-- 5. Constraint check
select
  tc.table_name,
  tc.constraint_name,
  tc.constraint_type
from information_schema.table_constraints tc
where tc.table_schema = 'public'
  and tc.table_name in (
    'subscriber_profiles',
    'subscriptions',
    'subscriber_daily_guidance',
    'user_submissions',
    'feedback_submissions',
    'palmistry_requests',
    'knowledge_update_reviews'
  )
order by tc.table_name, tc.constraint_name;

-- Expected: primary keys, foreign keys, unique constraints, and check constraints present.

-- 6. Critical column defaults check
select
  table_name,
  column_name,
  column_default,
  is_nullable
from information_schema.columns
where table_schema = 'public'
  and (
    (table_name = 'subscriber_daily_guidance' and column_name in ('public_display_allowed', 'subscriber_display_allowed', 'generation_status', 'review_status'))
    or (table_name = 'palmistry_requests' and column_name in ('image_upload_enabled', 'consent_to_process_image', 'consent_to_process_request', 'review_status'))
    or (table_name = 'user_submissions' and column_name in ('consent_to_process', 'review_status'))
    or (table_name = 'knowledge_update_reviews' and column_name in ('scheduled_day', 'public_output_enabled', 'status'))
  )
order by table_name, column_name;

-- Expected:
-- subscriber_daily_guidance.public_display_allowed = false
-- subscriber_daily_guidance.subscriber_display_allowed = false
-- palmistry_requests.image_upload_enabled = false
-- knowledge_update_reviews.scheduled_day = 10
-- knowledge_update_reviews.public_output_enabled = false

-- 7. Function check
select
  n.nspname as schema_name,
  p.proname as function_name
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname = 'set_updated_at';

-- Expected: public.set_updated_at exists.

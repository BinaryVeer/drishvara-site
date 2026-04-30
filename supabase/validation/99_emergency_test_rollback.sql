-- Drishvara Activation Stage 01B
-- Emergency rollback SQL for TEST ENVIRONMENT ONLY.
-- Do not run in production without backup/export confirmation.

drop table if exists public.knowledge_update_reviews cascade;
drop table if exists public.palmistry_requests cascade;
drop table if exists public.feedback_submissions cascade;
drop table if exists public.user_submissions cascade;
drop table if exists public.subscriber_daily_guidance cascade;
drop table if exists public.subscriptions cascade;
drop table if exists public.subscriber_profiles cascade;

drop function if exists public.set_updated_at() cascade;

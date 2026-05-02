-- Drishvara B20A: Supabase backend schema scaffold
-- Purpose: subscribers, subscriptions, daily guidance cache, submissions, feedback,
-- palmistry requests, and Knowledge Vault monthly reviews.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.subscriber_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  full_name text,
  preferred_language text not null default 'en' check (preferred_language in ('en', 'hi')),
  date_of_birth date,
  birth_time time,
  birth_place text,
  current_location jsonb not null default '{}'::jsonb,
  consent_personal_guidance boolean not null default false,
  consent_profile_storage boolean not null default false,
  profile_status text not null default 'active' check (profile_status in ('active', 'paused', 'deleted')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null default 'manual',
  provider_customer_id text,
  provider_subscription_id text,
  plan_code text not null default 'free',
  status text not null default 'free' check (status in ('free', 'trial', 'active', 'past_due', 'cancelled', 'expired')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, provider_subscription_id)
);

create index if not exists subscriptions_user_status_idx
on public.subscriptions (user_id, status);

create table if not exists public.subscriber_daily_guidance (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  guidance_date date not null,
  timezone text not null default 'Asia/Kolkata',
  location_basis jsonb not null default '{}'::jsonb,
  guidance_payload jsonb not null default '{}'::jsonb,
  generation_status text not null default 'scaffold_only' check (generation_status in ('scaffold_only', 'generated', 'blocked', 'failed')),
  review_status text not null default 'under_review' check (review_status in ('under_review', 'system_approved', 'approved', 'rejected')),
  knowledge_db_version text,
  panchang_engine_version text,
  public_display_allowed boolean not null default false,
  subscriber_display_allowed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, guidance_date)
);

create index if not exists subscriber_daily_guidance_user_date_idx
on public.subscriber_daily_guidance (user_id, guidance_date desc);

create table if not exists public.user_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  submission_type text not null check (submission_type in (
    'general_question',
    'personal_story',
    'vedic_guidance_question',
    'panchang_question',
    'festival_question',
    'numerology_question',
    'palmistry_question',
    'knowledge_correction',
    'other'
  )),
  name text,
  email text,
  phone text,
  location text,
  preferred_language text default 'en' check (preferred_language in ('en', 'hi')),
  question_or_story text not null,
  context_details text,
  consent_to_process boolean not null default false,
  consent_to_contact boolean not null default false,
  review_status text not null default 'pending' check (review_status in ('pending', 'reviewed', 'needs_more_info', 'rejected', 'archived')),
  review_note text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_submissions_consent_required check (consent_to_process = true)
);

create index if not exists user_submissions_type_status_idx
on public.user_submissions (submission_type, review_status, created_at desc);

create table if not exists public.feedback_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  feedback_type text not null check (feedback_type in (
    'article_feedback',
    'translation_feedback',
    'knowledge_correction',
    'panchang_feedback',
    'festival_feedback',
    'numerology_feedback',
    'palmistry_feedback',
    'bug_report',
    'feature_request',
    'general_feedback'
  )),
  page_url text,
  article_path text,
  message text not null,
  name text,
  email text,
  rating integer check (rating is null or (rating between 1 and 5)),
  consent_to_contact boolean not null default false,
  review_status text not null default 'pending' check (review_status in ('pending', 'reviewed', 'accepted', 'rejected', 'archived')),
  review_note text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists feedback_submissions_type_status_idx
on public.feedback_submissions (feedback_type, review_status, created_at desc);

create table if not exists public.palmistry_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  question text not null,
  context_details text,
  dominant_hand text check (dominant_hand is null or dominant_hand in ('left', 'right', 'ambidextrous', 'unknown')),
  palm_side text check (palm_side is null or palm_side in ('left', 'right', 'both', 'unknown')),
  age_range text,
  gender text,
  image_upload_enabled boolean not null default false,
  image_storage_path text,
  image_mime_type text,
  consent_to_process_image boolean not null default false,
  consent_to_delete_after_review boolean not null default false,
  consent_to_process_request boolean not null default false,
  review_status text not null default 'pending' check (review_status in ('pending', 'reviewed', 'needs_more_info', 'rejected', 'archived')),
  review_note text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint palmistry_request_consent_required check (consent_to_process_request = true),
  constraint palm_image_consent_required check (
    image_upload_enabled = false
    or consent_to_process_image = true
  ),
  constraint palm_image_private_path_only check (
    image_storage_path is null
    or image_storage_path not like 'http%'
  )
);

create index if not exists palmistry_requests_status_idx
on public.palmistry_requests (review_status, created_at desc);

create table if not exists public.knowledge_update_reviews (
  id uuid primary key default gen_random_uuid(),
  update_month date not null,
  scheduled_day integer not null default 10 check (scheduled_day = 10),
  scope text not null,
  status text not null default 'pending' check (status in ('pending', 'in_review', 'approved', 'rejected', 'archived')),
  reviewer_user_id uuid references auth.users(id) on delete set null,
  summary text,
  review_notes text,
  changed_files jsonb not null default '[]'::jsonb,
  public_output_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists knowledge_update_reviews_month_idx
on public.knowledge_update_reviews (update_month desc, status);

drop trigger if exists set_subscriber_profiles_updated_at on public.subscriber_profiles;
create trigger set_subscriber_profiles_updated_at
before update on public.subscriber_profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_subscriptions_updated_at on public.subscriptions;
create trigger set_subscriptions_updated_at
before update on public.subscriptions
for each row execute function public.set_updated_at();

drop trigger if exists set_subscriber_daily_guidance_updated_at on public.subscriber_daily_guidance;
create trigger set_subscriber_daily_guidance_updated_at
before update on public.subscriber_daily_guidance
for each row execute function public.set_updated_at();

drop trigger if exists set_user_submissions_updated_at on public.user_submissions;
create trigger set_user_submissions_updated_at
before update on public.user_submissions
for each row execute function public.set_updated_at();

drop trigger if exists set_feedback_submissions_updated_at on public.feedback_submissions;
create trigger set_feedback_submissions_updated_at
before update on public.feedback_submissions
for each row execute function public.set_updated_at();

drop trigger if exists set_palmistry_requests_updated_at on public.palmistry_requests;
create trigger set_palmistry_requests_updated_at
before update on public.palmistry_requests
for each row execute function public.set_updated_at();

drop trigger if exists set_knowledge_update_reviews_updated_at on public.knowledge_update_reviews;
create trigger set_knowledge_update_reviews_updated_at
before update on public.knowledge_update_reviews
for each row execute function public.set_updated_at();

alter table public.subscriber_profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.subscriber_daily_guidance enable row level security;
alter table public.user_submissions enable row level security;
alter table public.feedback_submissions enable row level security;
alter table public.palmistry_requests enable row level security;
alter table public.knowledge_update_reviews enable row level security;

create policy "subscriber_profiles_select_own"
on public.subscriber_profiles
for select
using (auth.uid() = user_id);

create policy "subscriber_profiles_insert_own"
on public.subscriber_profiles
for insert
with check (auth.uid() = user_id);

create policy "subscriber_profiles_update_own"
on public.subscriber_profiles
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "subscriptions_select_own"
on public.subscriptions
for select
using (auth.uid() = user_id);

create policy "subscriber_daily_guidance_select_own"
on public.subscriber_daily_guidance
for select
using (auth.uid() = user_id);

create policy "user_submissions_select_own"
on public.user_submissions
for select
using (auth.uid() = user_id);

create policy "user_submissions_insert_own"
on public.user_submissions
for insert
with check (auth.uid() = user_id and consent_to_process = true);

create policy "feedback_submissions_select_own"
on public.feedback_submissions
for select
using (auth.uid() = user_id);

create policy "feedback_submissions_insert_own"
on public.feedback_submissions
for insert
with check (auth.uid() = user_id);

create policy "palmistry_requests_select_own"
on public.palmistry_requests
for select
using (auth.uid() = user_id);

create policy "palmistry_requests_insert_own"
on public.palmistry_requests
for insert
with check (
  auth.uid() = user_id
  and consent_to_process_request = true
  and (
    image_upload_enabled = false
    or consent_to_process_image = true
  )
);

comment on table public.subscriber_profiles is 'Drishvara subscriber profile and consent context.';
comment on table public.subscriptions is 'Subscription and plan status table. Payment provider integration comes later.';
comment on table public.subscriber_daily_guidance is 'Cached subscriber daily guidance payload; not public.';
comment on table public.user_submissions is 'Subscriber/user question, story, and correction submissions.';
comment on table public.feedback_submissions is 'Feedback and bug/feature/correction submissions.';
comment on table public.palmistry_requests is 'Palmistry question/request table. Image upload remains disabled until storage and consent implementation.';
comment on table public.knowledge_update_reviews is 'Monthly Knowledge Vault update review records, scheduled for the 10th.';

-- SUP01 Panchang runtime foundation and privilege hardening.
-- This migration contains no credentials and persists no public calculation inputs.

create table if not exists public.drishvara_panchang_location_aliases (
  id text primary key,
  release_id text not null,
  alias_normalized text not null,
  canonical_place_id text not null,
  selector_value text not null,
  display_label text not null,
  timezone text not null,
  latitude double precision not null check (latitude between -90 and 90),
  longitude double precision not null check (longitude between -180 and 180),
  payload jsonb not null,
  content_hash text not null,
  created_at timestamptz not null default now(),
  unique (release_id, alias_normalized, canonical_place_id)
);

create table if not exists public.drishvara_panchang_calculation_policies (
  id text primary key,
  release_id text not null,
  request_mode text not null check (request_mode in ('named_location','coordinates')),
  canonical_place_id text,
  supported_start date not null,
  supported_end date not null,
  validated_iana_timezone_required boolean not null,
  output_mode text not null,
  payload jsonb not null,
  content_hash text not null,
  created_at timestamptz not null default now(),
  check (supported_end >= supported_start)
);

create table if not exists public.drishvara_festival_rules (
  id text primary key,
  release_id text not null,
  rule_id text not null,
  observance_key text not null,
  approval_status text not null,
  scope_limitation text not null,
  payload jsonb not null,
  content_hash text not null,
  created_at timestamptz not null default now(),
  unique (release_id, rule_id)
);

create table if not exists public.drishvara_panchang_runtime_releases (
  runtime_release_id text primary key,
  release_id text not null,
  status text not null check (status in ('staged','active','retired')),
  engine_package text not null,
  engine_package_version text not null,
  astronomical_profile_id text not null,
  ayanamsha_profile_id text not null,
  no_input_persistence boolean not null default true,
  public_ui_cutover_active boolean not null default false,
  payload jsonb not null,
  content_hash text not null,
  created_at timestamptz not null default now(),
  activated_at timestamptz
);

create index if not exists idx_sup01_alias_release
  on public.drishvara_panchang_location_aliases(release_id);
create index if not exists idx_sup01_alias_normalized
  on public.drishvara_panchang_location_aliases(alias_normalized);
create index if not exists idx_sup01_policy_release
  on public.drishvara_panchang_calculation_policies(release_id);
create index if not exists idx_sup01_rule_release
  on public.drishvara_festival_rules(release_id);
create index if not exists idx_sup01_runtime_release
  on public.drishvara_panchang_runtime_releases(release_id,status);

alter table public.drishvara_panchang_location_aliases enable row level security;
alter table public.drishvara_panchang_calculation_policies enable row level security;
alter table public.drishvara_festival_rules enable row level security;
alter table public.drishvara_panchang_runtime_releases enable row level security;

-- Remove excessive table privileges. RLS does not govern TRUNCATE.
revoke all privileges on table public.drishvara_panchang_locations from anon, authenticated;
revoke all privileges on table public.drishvara_panchang_daily_records from anon, authenticated;
revoke all privileges on table public.drishvara_festival_observances from anon, authenticated;
revoke all privileges on table public.drishvara_star_reflection_releases from anon, authenticated;
revoke all privileges on table public.drishvara_release_manifests from anon, authenticated;
revoke all privileges on table public.drishvara_panchang_location_aliases from anon, authenticated;
revoke all privileges on table public.drishvara_panchang_calculation_policies from anon, authenticated;
revoke all privileges on table public.drishvara_festival_rules from anon, authenticated;
revoke all privileges on table public.drishvara_panchang_runtime_releases from anon, authenticated;

grant select on table public.drishvara_panchang_locations to anon, authenticated;
grant select on table public.drishvara_panchang_daily_records to anon, authenticated;
grant select on table public.drishvara_festival_observances to anon, authenticated;
grant select on table public.drishvara_star_reflection_releases to anon, authenticated;
grant select on table public.drishvara_release_manifests to anon, authenticated;
grant select on table public.drishvara_panchang_location_aliases to anon, authenticated;
grant select on table public.drishvara_panchang_calculation_policies to anon, authenticated;
grant select on table public.drishvara_festival_rules to anon, authenticated;
grant select on table public.drishvara_panchang_runtime_releases to anon, authenticated;

drop policy if exists ag74p_locations_public_read on public.drishvara_panchang_locations;
create policy ag74p_locations_public_read on public.drishvara_panchang_locations
for select to anon, authenticated
using (exists (
  select 1 from public.drishvara_release_manifests m
  where m.release_id = drishvara_panchang_locations.release_id
    and m.status = 'active'
));

drop policy if exists ag74p_daily_public_read on public.drishvara_panchang_daily_records;
create policy ag74p_daily_public_read on public.drishvara_panchang_daily_records
for select to anon, authenticated
using (exists (
  select 1 from public.drishvara_release_manifests m
  where m.release_id = drishvara_panchang_daily_records.release_id
    and m.status = 'active'
));

drop policy if exists ag74p_festival_public_read on public.drishvara_festival_observances;
create policy ag74p_festival_public_read on public.drishvara_festival_observances
for select to anon, authenticated
using (exists (
  select 1 from public.drishvara_release_manifests m
  where m.release_id = drishvara_festival_observances.release_id
    and m.status = 'active'
));

drop policy if exists ag74p_star_public_read on public.drishvara_star_reflection_releases;
create policy ag74p_star_public_read on public.drishvara_star_reflection_releases
for select to anon, authenticated
using (exists (
  select 1 from public.drishvara_release_manifests m
  where m.release_id = drishvara_star_reflection_releases.release_id
    and m.status = 'active'
));

drop policy if exists ag74p_manifest_public_read on public.drishvara_release_manifests;
create policy ag74p_manifest_public_read on public.drishvara_release_manifests
for select to anon, authenticated using (status = 'active');

drop policy if exists sup01_alias_public_read on public.drishvara_panchang_location_aliases;
create policy sup01_alias_public_read on public.drishvara_panchang_location_aliases
for select to anon, authenticated
using (exists (
  select 1 from public.drishvara_release_manifests m
  where m.release_id = drishvara_panchang_location_aliases.release_id
    and m.status = 'active'
));

drop policy if exists sup01_policy_public_read on public.drishvara_panchang_calculation_policies;
create policy sup01_policy_public_read on public.drishvara_panchang_calculation_policies
for select to anon, authenticated
using (exists (
  select 1 from public.drishvara_release_manifests m
  where m.release_id = drishvara_panchang_calculation_policies.release_id
    and m.status = 'active'
));

drop policy if exists sup01_rule_public_read on public.drishvara_festival_rules;
create policy sup01_rule_public_read on public.drishvara_festival_rules
for select to anon, authenticated
using (exists (
  select 1 from public.drishvara_release_manifests m
  where m.release_id = drishvara_festival_rules.release_id
    and m.status = 'active'
));

drop policy if exists sup01_runtime_public_read on public.drishvara_panchang_runtime_releases;
create policy sup01_runtime_public_read on public.drishvara_panchang_runtime_releases
for select to anon, authenticated
using (
  status = 'active'
  and public_ui_cutover_active = false
  and exists (
    select 1 from public.drishvara_release_manifests m
    where m.release_id = drishvara_panchang_runtime_releases.release_id
      and m.status = 'active'
  )
);

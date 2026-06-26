-- SUP02 public Panchang runtime cutover readiness.
-- This migration does not activate the public cutover flag.
-- It persists no calculation request, coordinate, timezone or personal input.

begin;

alter table public.drishvara_panchang_runtime_releases
  drop constraint if exists sup02_public_cutover_requires_active_runtime;

alter table public.drishvara_panchang_runtime_releases
  add constraint sup02_public_cutover_requires_active_runtime
  check (
    public_ui_cutover_active = false
    or (
      status = 'active'
      and no_input_persistence = true
    )
  );

drop policy if exists sup01_runtime_public_read
  on public.drishvara_panchang_runtime_releases;

drop policy if exists sup02_runtime_public_read
  on public.drishvara_panchang_runtime_releases;

create policy sup02_runtime_public_read
  on public.drishvara_panchang_runtime_releases
  for select
  to anon, authenticated
  using (
    status = 'active'
    and no_input_persistence = true
    and exists (
      select 1
      from public.drishvara_release_manifests m
      where m.release_id = drishvara_panchang_runtime_releases.release_id
        and m.status = 'active'
    )
  );

revoke all privileges
  on table public.drishvara_panchang_runtime_releases
  from anon, authenticated;

grant select
  on table public.drishvara_panchang_runtime_releases
  to anon, authenticated;

comment on constraint sup02_public_cutover_requires_active_runtime
  on public.drishvara_panchang_runtime_releases
  is 'SUP02 permits public cutover only for an active zero-input-persistence runtime release.';

commit;

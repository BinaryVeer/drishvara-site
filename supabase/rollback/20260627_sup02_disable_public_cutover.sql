-- SUP02 guarded rollback operation source.
-- Execute only through the reviewed SUP02 rollback wrapper with explicit confirmation.

update public.drishvara_panchang_runtime_releases
set public_ui_cutover_active = false
where runtime_release_id = 'sup01_panchang_runtime_v1'
  and status = 'active'
  and no_input_persistence = true;

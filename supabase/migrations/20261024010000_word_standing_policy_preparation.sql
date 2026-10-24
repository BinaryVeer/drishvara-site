-- PREPARED ONLY. No policy/content is seeded and no activation control is changed.
-- Requires the original assignment migration and separately approved deployment.
begin;

create function drishvara_word_private.require_standing_policy(p_date text) returns jsonb
language plpgsql stable set search_path = pg_catalog, drishvara_word_private as $$
declare c drishvara_word_private.controls; d jsonb; cfg jsonb; p jsonb; a jsonb; ref text; base_ref text;
begin
  if p_date is distinct from to_char(current_timestamp at time zone 'Asia/Kolkata','YYYY-MM-DD') then
    raise exception 'word_standing_requires_current_ist_date';
  end if;
  select * into c from drishvara_word_private.controls where singleton;
  if not c.persistence_enabled or not c.publication_enabled then raise exception 'word_standing_not_activated'; end if;
  d := drishvara_word_private.require_reference(c.deployment_approval_ref,'deployment'); cfg := d->'configuration';
  if cfg->>'contract_version' is distinct from 'ag70e.word-release.v1' or
     cfg->>'timezone' is distinct from 'Asia/Kolkata' or cfg->>'publication_scope' is distinct from 'global_public_word' or
     cfg->'runtime_activation' is distinct from 'true'::jsonb or cfg->'public_output_allowed' is distinct from 'true'::jsonb or cfg->'persistence'->'enabled' is distinct from 'true'::jsonb or
     cfg->'standing_authorization'->'enabled' is distinct from 'true'::jsonb or
     cfg->'publication'->>'review_status' is distinct from 'approved' or
     cfg->'publication'->'public_output_allowed' is distinct from 'true'::jsonb or cfg->'publication'->'runtime_activation' is distinct from 'true'::jsonb or
     cfg->'persistence'->>'server_authorization_ref' is distinct from d->>'authorization_ref' then raise exception 'word_standing_not_activated'; end if;
  perform drishvara_word_private.require_reference(cfg->'standing_authorization'->>'production_approval_ref','approval');
  perform drishvara_word_private.require_reference(cfg->'publication'->>'approval_ref','approval');
  a := drishvara_word_private.require_reference(d->>'authorization_ref','authorization');
  if coalesce(length(a->>'actor_ref'),0)=0 or jsonb_typeof(a->'capabilities') is distinct from 'array' or
     not(a->'capabilities' ?& array['selection_proposal','reservation','authorized_assignment','publication']) then raise exception 'word_standing_actor_unapproved'; end if;
  ref := cfg->'standing_authorization'->>'policy_ref'; p := drishvara_word_private.require_reference(ref,'approval');
  if not exists(select 1 from drishvara_word_private.versioned_references r where r.ref_id=ref and r.version=p->>'version' and r.approval_ref=p->>'approval_ref') then raise exception 'word_standing_policy_metadata_mismatch'; end if;
  if p->>'contract_version' is distinct from 'ag70e.word-publisher-policy.v1' or p->>'review_status' is distinct from 'approved' or
     p->>'record_ref' is distinct from ref or ref is distinct from (p->>'policy_id')||'@'||(p->>'version') or
     coalesce(length(p->>'policy_id'),0)=0 or coalesce(length(p->>'version'),0)=0 or
     coalesce(length(p->>'approval_ref'),0)=0 or coalesce(length(p->>'decision_authority'),0)=0 or
     p->>'timezone' is distinct from 'Asia/Kolkata' or p->>'publication_scope' is distinct from 'global_public_word' or
     p->'revoked' is distinct from 'false'::jsonb or p->'superseded_by' is distinct from 'null'::jsonb or
     p->'rules' is distinct from '{"global_ist_civil_date":true,"unused_approved_eligible_first":true,"withhold_on_exhaustion":true,"standing_routine_publication":true,"requires_all_individual_approvals":true}'::jsonb then raise exception 'word_standing_policy_unapproved'; end if;
  if coalesce(p->>'decision_date','') !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' or (p->>'decision_date')::date::text<>p->>'decision_date' or (p->>'decision_date')::date>p_date::date or
     coalesce(p->>'valid_from','') !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' or (p->>'valid_from')::date::text<>p->>'valid_from' or (p->>'valid_from')::date>p_date::date then raise exception 'word_standing_policy_not_effective'; end if;
  if p->'expires_on' is distinct from 'null'::jsonb then
    if coalesce(p->>'expires_on','') !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' or (p->>'expires_on')::date::text<>p->>'expires_on' or (p->>'expires_on')::date<p_date::date then raise exception 'word_standing_policy_expired'; end if;
  end if;
  base_ref := coalesce(d->>'standing_parent_deployment_ref',c.deployment_approval_ref);
  perform drishvara_word_private.require_reference(base_ref,'deployment');
  return jsonb_build_object('policy_ref',ref,'policy',p,'configuration',cfg,'deployment',d,'base_deployment_ref',base_ref);
end $$;

create function drishvara_word_private.assert_standing_copy(r jsonb) returns void
language plpgsql stable set search_path = pg_catalog, drishvara_word_private as $$
declare cp jsonb; content jsonb; item jsonb; review jsonb; k text; hash text;
begin
  perform drishvara_word_private.require_reference((r->>'output_candidate_id')||'@'||(r->>'approved_record_version'),'candidate',drishvara_word_private.content_hash(r));
  cp := r->'reviewed_publication_copy'; content := cp->'content'; hash := drishvara_word_private.content_hash(content);
  if cp->>'contract_version' is distinct from 'ag70e.word-copy.v1' or coalesce(length(cp->>'version'),0)=0 or
     jsonb_typeof(content) is distinct from 'object' or jsonb_typeof(cp->'reviews') is distinct from 'array' then raise exception 'word_standing_copy_unapproved'; end if;
  foreach k in array array['english','hindi','sanskrit','meaning_en','meaning_hi','reflection_en','reflection_hi'] loop
    if jsonb_typeof(content->k) is distinct from 'string' or length(btrim(content->>k))=0 then raise exception 'word_standing_copy_unapproved'; end if;
  end loop;
  foreach k in array array['linguistic','editorial','rights','context','safety'] loop
    if (select count(*) from jsonb_array_elements(cp->'reviews') v where v->>'kind'=k and v->>'review_status'='approved' and v->>'content_hash'=hash)<>1 then raise exception 'word_standing_copy_unapproved'; end if;
    select v into review from jsonb_array_elements(cp->'reviews') v where v->>'kind'=k and v->>'review_status'='approved' and v->>'content_hash'=hash;
    perform drishvara_word_private.require_reference(review->>'approval_ref','approval');
  end loop;
  if content->'iast' is distinct from 'null'::jsonb then
    if jsonb_typeof(content->'iast') is distinct from 'string' or length(btrim(content->>'iast'))=0 or cp->>'iast_review_status' is distinct from 'approved' then raise exception 'word_standing_iast_unapproved'; end if;
    perform drishvara_word_private.require_reference(cp->>'iast_approval_ref','approval');
  end if;
  if jsonb_typeof(content->'sources') is distinct from 'array' or jsonb_array_length(content->'sources')=0 then raise exception 'word_standing_source_unapproved'; end if;
  for item in select value from jsonb_array_elements(content->'sources') loop
    if item->>'review_status' is distinct from 'approved' or coalesce(item->>'url','') !~ '^https://[^/@[:space:]]+(/[^[:space:]]*)?$' then raise exception 'word_standing_source_unapproved'; end if;
    foreach k in array array['title','publisher','attribution'] loop
      if coalesce(length(btrim(item->>k)),0)=0 then raise exception 'word_standing_source_unapproved'; end if;
    end loop;
    if not exists(select 1 from jsonb_array_elements(r->'source_evidence') e where e->>'evidence_ref'=item->>'evidence_ref' and e->>'review_status'='approved') then raise exception 'word_standing_source_unapproved'; end if;
    perform drishvara_word_private.require_reference(item->>'evidence_ref','source');
    perform drishvara_word_private.require_reference(item->>'reuse_approval_ref','approval');
  end loop;
end $$;

create function drishvara_word_private.guard_standing_event() returns trigger
language plpgsql set search_path = pg_catalog, drishvara_word_private as $$
declare decision jsonb; info jsonb; snapshot jsonb;
begin
  if new.payload->>'event_type' in ('authorized_assignment','publication') then
    decision := drishvara_word_private.require_reference(new.payload->>'decision_approval_ref','decision');
    if decision->>'authorization_basis'='standing_publisher_policy' then
      select s.snapshot into snapshot from drishvara_word_private.assignment_snapshots s join drishvara_word_private.date_claims c using(proposal_id) where c.assignment_id=new.assignment_id;
      info := drishvara_word_private.require_standing_policy(snapshot->>'date_key');
      if decision->>'publisher_policy_ref' is distinct from info->>'policy_ref' or
         decision->>'publisher_policy_version' is distinct from info->'policy'->>'version' or
         decision->>'publisher_policy_approval_ref' is distinct from info->'policy'->>'approval_ref' then raise exception 'word_standing_policy_mismatch'; end if;
      perform drishvara_word_private.assert_standing_copy(snapshot->'approved_record_snapshot');
    end if;
  end if;
  return new;
end $$;
create trigger word_standing_policy_at_commit before insert on drishvara_word_private.events
for each row execute function drishvara_word_private.guard_standing_event();

create function public.word_assignment_standing_decision(p_date text,p_operation text) returns jsonb
language plpgsql security definer set search_path = pg_catalog, drishvara_word_private as $$
declare info jsonb; p jsonb; d jsonb; base jsonb; claim drishvara_word_private.date_claims; snapshot jsonb; event jsonb;
  ref text; payload jsonb; base_ref text; deployment_ref text; approval text;
begin
  if p_operation is null or p_operation not in ('inspect','authorize','record_publication','release') then raise exception 'word_standing_invalid_operation'; end if;
  if p_operation='inspect' then
    perform 1 from drishvara_word_private.controls where singleton for share;
  else
    perform 1 from drishvara_word_private.controls where singleton for update;
  end if;
  info := drishvara_word_private.require_standing_policy(p_date); p := info->'policy';
  if p_operation='inspect' then return info-'deployment'-'base_deployment_ref'; end if;
  -- Same lock order as commit; deterministic inserts never replace prior decisions.
  perform 1 from drishvara_word_private.ledger_head where singleton for update;
  select * into claim from drishvara_word_private.date_claims where date_key::text=p_date and state<>'cancelled_reservation' for update;
  if not found or claim.state not in ('reservation','authorized_assignment','publication') or
     (p_operation in ('record_publication','release') and claim.state='reservation') or
     (p_operation='release' and claim.state<>'publication') then raise exception 'word_standing_assignment_unavailable'; end if;
  select s.snapshot into snapshot from drishvara_word_private.assignment_snapshots s where s.proposal_id=claim.proposal_id;
  perform drishvara_word_private.assert_standing_copy(snapshot->'approved_record_snapshot');
  perform drishvara_word_private.require_reference(snapshot->>'canonical_context_basis_ref','context',snapshot->>'context_content_hash');
  perform drishvara_word_private.require_reference(snapshot->>'precedence_rule_ref','precedence',snapshot->>'precedence_content_hash');
  payload := jsonb_build_object('authorization_basis','standing_publisher_policy','publisher_policy_ref',info->>'policy_ref',
    'publisher_policy_version',p->>'version','publisher_policy_approval_ref',p->>'approval_ref','proposal_id',claim.proposal_id);
  if p_operation<>'release' then
    payload := payload||jsonb_build_object('event_type',case p_operation when 'authorize' then 'authorized_assignment' else 'publication' end);
    ref := 'word-standing-decision:'||drishvara_word_private.content_hash(payload);
    insert into drishvara_word_private.versioned_references(ref_id,kind,version,payload,review_status,reviewer_id,approval_ref)
      values(ref,'decision','1',payload,'approved','system:standing-policy-derivation',p->>'approval_ref') on conflict do nothing;
    perform drishvara_word_private.require_reference(ref,'decision',drishvara_word_private.content_hash(payload));
    return jsonb_build_object('decision_ref',ref,'policy_ref',info->>'policy_ref','policy_version',p->>'version');
  end if;
  select e.payload into event from drishvara_word_private.events e where e.event_id=claim.last_event_id;
  d := drishvara_word_private.require_reference(event->>'decision_approval_ref','decision');
  if d->>'publisher_policy_ref' is distinct from info->>'policy_ref' or d->>'publisher_policy_version' is distinct from p->>'version' then raise exception 'word_standing_policy_mismatch'; end if;
  payload := payload||jsonb_build_object('review_status','approved','approval_ref',p->>'approval_ref',
    'public_output_allowed',true,'runtime_activation',true,'approved_publication_event_refs',jsonb_build_array(claim.last_event_id));
  ref := 'word-standing-release:'||drishvara_word_private.content_hash(payload);
  insert into drishvara_word_private.versioned_references(ref_id,kind,version,payload,review_status,reviewer_id,approval_ref)
    values(ref,'deployment','1',payload,'approved','system:standing-policy-derivation',p->>'approval_ref') on conflict do nothing;
  perform drishvara_word_private.require_reference(ref,'deployment',drishvara_word_private.content_hash(payload));
  base_ref := info->>'base_deployment_ref'; base := drishvara_word_private.require_reference(base_ref,'deployment');
  select approval_ref into approval from drishvara_word_private.versioned_references where ref_id=base_ref;
  d := base||jsonb_build_object('publication_release_ref',ref,'standing_parent_deployment_ref',base_ref);
  deployment_ref := 'word-standing-deployment:'||drishvara_word_private.content_hash(jsonb_build_array(base_ref,ref));
  insert into drishvara_word_private.versioned_references(ref_id,kind,version,payload,review_status,reviewer_id,approval_ref)
    values(deployment_ref,'deployment','1',d,'approved','system:standing-policy-derivation',approval) on conflict do nothing;
  perform drishvara_word_private.require_reference(deployment_ref,'deployment',drishvara_word_private.content_hash(d));
  update drishvara_word_private.controls set deployment_approval_ref=deployment_ref where singleton;
  return jsonb_build_object('policy_ref',info->>'policy_ref','policy_version',p->>'version','publication_event_id',claim.last_event_id);
end $$;

-- Retain the original export checks verbatim behind a policy-aware public wrapper.
alter function public.word_assignment_release_snapshot(text) set schema drishvara_word_private;
alter function drishvara_word_private.word_assignment_release_snapshot(text) rename to manual_release_snapshot;
revoke all on function drishvara_word_private.manual_release_snapshot(text) from public,anon,authenticated,service_role;
create function public.word_assignment_release_snapshot(p_date text) returns jsonb
language plpgsql security definer set search_path = pg_catalog, drishvara_word_private as $$
declare result jsonb; info jsonb;
begin
  result := drishvara_word_private.manual_release_snapshot(p_date);
  if result->'release'->>'authorization_basis'='standing_publisher_policy' then
    info := drishvara_word_private.require_standing_policy(p_date);
    if result->'release'->>'publisher_policy_ref' is distinct from info->>'policy_ref' or
       result->'release'->>'publisher_policy_version' is distinct from info->'policy'->>'version' then raise exception 'word_standing_policy_mismatch'; end if;
  end if;
  return result;
end $$;
revoke all on function drishvara_word_private.require_standing_policy(text),drishvara_word_private.assert_standing_copy(jsonb),drishvara_word_private.guard_standing_event() from public,anon,authenticated,service_role;
revoke all on function public.word_assignment_standing_decision(text,text),public.word_assignment_release_snapshot(text) from public,anon,authenticated;
grant execute on function public.word_assignment_standing_decision(text,text),public.word_assignment_release_snapshot(text) to service_role;
commit;

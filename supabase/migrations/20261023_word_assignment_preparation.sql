-- PREPARED ONLY: do not apply without separate migration and operational approval.
-- No word, evidence approval, identity map, actor or reviewer is seeded.
begin;
create schema if not exists drishvara_word_private;
revoke all on schema drishvara_word_private from public, anon, authenticated, service_role;

-- Match the JS snapshot contract for ASCII object keys and safe integer numbers.
-- Unicode text values (including Sanskrit compounds) have no content-length cap.
create function drishvara_word_private.canonical_json(v jsonb) returns text
language plpgsql immutable strict set search_path = pg_catalog, drishvara_word_private as $$
declare result text; n numeric;
begin
  case jsonb_typeof(v)
    when 'object' then
      if exists(select 1 from jsonb_object_keys(v) k where k !~ '^[ -~]*$') then
        raise exception 'unsupported_snapshot_key';
      end if;
      select '{' || coalesce(string_agg(to_jsonb(key)::text || ':' || drishvara_word_private.canonical_json(value), ',' order by key collate "C"), '') || '}'
        into result from jsonb_each(v);
      return result;
    when 'array' then
      select '[' || coalesce(string_agg(drishvara_word_private.canonical_json(value), ',' order by ord), '') || ']'
        into result from jsonb_array_elements(v) with ordinality a(value, ord);
      return result;
    when 'number' then
      n := v::text::numeric;
      if n <> trunc(n) or abs(n) > 9007199254740991 then raise exception 'unsupported_snapshot_number'; end if;
      return trunc(n)::text;
    else return v::text;
  end case;
end $$;
create function drishvara_word_private.content_hash(v jsonb) returns text
language sql immutable strict set search_path = pg_catalog, drishvara_word_private as $$
  select 'sha256:' || encode(sha256(convert_to(drishvara_word_private.canonical_json(v), 'UTF8')), 'hex')
$$;

create table drishvara_word_private.controls (
  singleton boolean primary key default true check(singleton),
  persistence_enabled boolean not null default false,
  publication_enabled boolean not null default false,
  identity_snapshot_ref text,
  deployment_approval_ref text
);
insert into drishvara_word_private.controls(singleton) values(true);
create table drishvara_word_private.versioned_references (
  ref_id text primary key,
  kind text not null check(kind in ('candidate','context','precedence','identity','exclusions','source','approval','authorization','decision','deployment')),
  version text not null check(length(version) > 0),
  payload jsonb not null check(jsonb_typeof(payload) = 'object'),
  payload_hash text generated always as (drishvara_word_private.content_hash(payload)) stored,
  review_status text not null check(review_status in ('pending','approved')),
  reviewer_id text,
  approval_ref text,
  created_at timestamptz not null default now(),
  check(review_status <> 'approved' or (coalesce(length(reviewer_id),0) > 0 and coalesce(length(approval_ref),0) > 0))
);
create table drishvara_word_private.reference_revocations (
  ref_id text primary key references drishvara_word_private.versioned_references,
  approval_ref text not null,
  reason text not null,
  created_at timestamptz not null default now()
);
create table drishvara_word_private.assignment_snapshots (
  proposal_id text primary key,
  assignment_id text not null,
  snapshot jsonb not null,
  created_at timestamptz not null default now()
);
create table drishvara_word_private.events (
  event_id text primary key,
  sequence bigint not null unique check(sequence > 0),
  command_id text not null unique,
  assignment_id text not null,
  payload jsonb not null
);
create table drishvara_word_private.command_receipts (
  idempotency_key text primary key,
  request_hash text not null,
  receipt jsonb not null
);
create table drishvara_word_private.ledger_head (
  singleton boolean primary key default true check(singleton),
  revision bigint not null default 0,
  history_hash text not null default drishvara_word_private.content_hash('[]'::jsonb)
);
insert into drishvara_word_private.ledger_head(singleton) values(true);

-- Mutable claim indexes are rebuildable from immutable snapshots/events, not history owners.
create table drishvara_word_private.date_claims (
  assignment_id text primary key,
  publication_scope text not null check(publication_scope = 'global_public_word'),
  date_key date not null,
  timezone text not null check(timezone = 'Asia/Kolkata'),
  proposal_id text not null references drishvara_word_private.assignment_snapshots,
  last_event_id text not null references drishvara_word_private.events,
  publication_event_id text references drishvara_word_private.events,
  state text not null check(state in ('reservation','authorized_assignment','publication','correction','withdrawal','supersession','cancelled_reservation'))
);
create unique index word_one_active_date on drishvara_word_private.date_claims(publication_scope,date_key,timezone)
  where state <> 'cancelled_reservation';
create table drishvara_word_private.identity_claims (
  kind text not null check(kind in ('canonical_lexical_identity_id','lemma_id','equivalence_group_id')),
  value text not null,
  assignment_id text not null references drishvara_word_private.date_claims,
  primary key(kind,value)
);

create function drishvara_word_private.reject_history_mutation() returns trigger
language plpgsql set search_path = pg_catalog as $$
begin raise exception 'word_history_is_append_only'; end $$;
do $$
declare t text;
begin
  foreach t in array array['versioned_references','reference_revocations','assignment_snapshots','events','command_receipts'] loop
    execute format('create trigger word_no_rewrite before update or delete on drishvara_word_private.%I for each row execute function drishvara_word_private.reject_history_mutation()',t);
    execute format('create trigger word_no_truncate before truncate on drishvara_word_private.%I for each statement execute function drishvara_word_private.reject_history_mutation()',t);
  end loop;
  foreach t in array array['controls','versioned_references','reference_revocations','assignment_snapshots','events','command_receipts','ledger_head','date_claims','identity_claims'] loop
    execute format('alter table drishvara_word_private.%I enable row level security',t);
    execute format('revoke all on table drishvara_word_private.%I from public, anon, authenticated, service_role',t);
  end loop;
end $$;

create function drishvara_word_private.require_reference(p_ref text, p_kind text, p_hash text default null) returns jsonb
language plpgsql stable set search_path = pg_catalog, drishvara_word_private as $$
declare r drishvara_word_private.versioned_references;
begin
  select * into r from drishvara_word_private.versioned_references where ref_id=p_ref and kind=p_kind and review_status='approved';
  if not found or exists(select 1 from drishvara_word_private.reference_revocations where ref_id=p_ref) or
     (p_hash is not null and r.payload_hash <> p_hash) then raise exception 'word_reference_unapproved'; end if;
  return r.payload;
end $$;

create function public.word_assignment_read_history() returns jsonb
language plpgsql security definer set search_path = pg_catalog, drishvara_word_private as $$
declare c drishvara_word_private.controls; result jsonb;
begin
  select * into c from drishvara_word_private.controls where singleton;
  if not c.persistence_enabled or c.identity_snapshot_ref is null then
    return jsonb_build_object('available',false,'complete',false,'reason','word_persistence_not_activated');
  end if;
  -- A single statement gives a consistent head + event snapshot under READ COMMITTED.
  select jsonb_build_object('contract_version','ag70d.word-assignment.v1','available',true,'complete',true,
    'revision',head.revision,'snapshot_ref',head.history_hash,'identity_snapshot_ref',c.identity_snapshot_ref,
    'events',coalesce((select jsonb_agg(payload order by sequence) from drishvara_word_private.events),'[]'::jsonb))
    into result from drishvara_word_private.ledger_head head where singleton;
  return result;
end $$;
create function public.word_assignment_read_command(p_key text) returns jsonb
language sql stable security definer set search_path = pg_catalog, drishvara_word_private as $$
  select receipt from drishvara_word_private.command_receipts where idempotency_key=p_key
$$;

create function public.word_assignment_commit(p_request jsonb) returns jsonb
language plpgsql security definer set search_path = pg_catalog, drishvara_word_private as $$
declare
  c drishvara_word_private.controls; h drishvara_word_private.ledger_head;
  prior drishvara_word_private.command_receipts; claim drishvara_word_private.date_claims;
  e jsonb; first_event jsonb; snapshot jsonb; record jsonb; proposal jsonb; authz jsonb; decision jsonb;
  all_events jsonb; receipt jsonb; identity_field text; exclusion_ref text; typ text; last_time text;
  key text; request_hash text; n bigint; batch_size integer;
begin
  select * into c from drishvara_word_private.controls where singleton for share;
  if not c.persistence_enabled then raise exception 'word_persistence_not_activated'; end if;
  perform drishvara_word_private.require_reference(c.deployment_approval_ref,'deployment');
  perform drishvara_word_private.require_reference(c.identity_snapshot_ref,'identity');
  select * into h from drishvara_word_private.ledger_head where singleton for update;
  if jsonb_typeof(p_request) is distinct from 'object' or not(p_request ?& array['idempotency_key','request_hash','expected_revision','expected_history_ref','events']) or
     exists(select 1 from unnest(array['idempotency_key','request_hash','expected_revision','expected_history_ref','events']) k where p_request->k='null'::jsonb) then raise exception 'invalid_word_command'; end if;
  key := p_request->>'idempotency_key'; request_hash := p_request->>'request_hash';
  if coalesce(length(key),0)=0 or coalesce(request_hash,'') !~ '^sha256:[0-9a-f]{64}$' then raise exception 'invalid_word_command'; end if;
  select * into prior from drishvara_word_private.command_receipts where idempotency_key=key;
  if found then
    if prior.request_hash <> request_hash then raise exception 'word_idempotency_conflict'; end if;
    return prior.receipt || jsonb_build_object('status','idempotent_replay');
  end if;
  if (p_request->>'expected_revision')::bigint <> h.revision or p_request->>'expected_history_ref' <> h.history_hash then
    return jsonb_build_object('status','conflict','public_output_allowed',false,'runtime_activation',false);
  end if;
  if jsonb_typeof(p_request->'events') is distinct from 'array' then raise exception 'invalid_word_events'; end if;
  batch_size := jsonb_array_length(p_request->'events'); first_event := p_request->'events'->0;
  if batch_size not in (1,2) or (first_event->>'event_type'='selection_proposal' and
     (batch_size<>2 or p_request->'events'->1->>'event_type'<>'reservation')) or
     (first_event->>'event_type'<>'selection_proposal' and batch_size<>1) then raise exception 'invalid_word_event_batch'; end if;
  select payload->>'timestamp' into last_time from drishvara_word_private.events order by sequence desc limit 1;
  n := h.revision;
  for e in select value from jsonb_array_elements(p_request->'events') loop
    n := n+1; typ := e->>'event_type';
    if jsonb_typeof(e) is distinct from 'object' or not(e ?& array['event_version','event_id','sequence','command_id','assignment_id','event_type','timestamp','parent_event_refs','authorization_ref','actor_ref','request_hash','public_output_allowed','runtime_activation']) or
       exists(select 1 from unnest(array['event_version','event_id','sequence','command_id','assignment_id','event_type','timestamp','parent_event_refs','authorization_ref','actor_ref','request_hash']) k where e->k='null'::jsonb or coalesce(length(e->>k),0)=0) or
       jsonb_typeof(e->'parent_event_refs') is distinct from 'array' or jsonb_typeof(e->'sequence') is distinct from 'number' then raise exception 'invalid_word_event'; end if;
    if e->>'event_version'<>'ag70d.word-event.v1' or (e->>'sequence')::bigint<>n or e->>'request_hash'<>request_hash or
       e->>'command_id'<>key||':'||typ or e->>'assignment_id'<>first_event->>'assignment_id' or
       e->'public_output_allowed' is distinct from 'false'::jsonb or e->'runtime_activation' is distinct from 'false'::jsonb or
       coalesce(e->>'timestamp','') !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}Z$' or
       (last_time is not null and e->>'timestamp'<last_time) then raise exception 'invalid_word_event'; end if;
    perform (e->>'timestamp')::timestamptz;
    if exists(select 1 from jsonb_array_elements_text(e->'parent_event_refs') p where not exists(select 1 from drishvara_word_private.events where event_id=p)) then raise exception 'word_parent_reference_missing'; end if;
    authz := drishvara_word_private.require_reference(e->>'authorization_ref','authorization');
    if authz->>'actor_ref' is distinct from e->>'actor_ref' or not coalesce(authz->'capabilities' ? typ,false) then raise exception 'word_actor_not_authorized'; end if;
    select * into claim from drishvara_word_private.date_claims where assignment_id=e->>'assignment_id';
    if typ='selection_proposal' then
      proposal := e->'proposal'; snapshot := proposal->'snapshot'; record := snapshot->'approved_record_snapshot';
      if jsonb_typeof(snapshot) is distinct from 'object' or not(snapshot ?& array['contract_version','selection_policy_version','timezone','publication_scope','date_key','identity_snapshot_ref','history_revision','history_snapshot_ref','created_at','approved_record_snapshot','context_content_hash','precedence_content_hash','identity_content_hash','exclusions_content_hash']) or
         exists(select 1 from unnest(array['contract_version','selection_policy_version','timezone','publication_scope','date_key','identity_snapshot_ref','history_revision','history_snapshot_ref','created_at','approved_record_snapshot','context_content_hash','precedence_content_hash','identity_content_hash','exclusions_content_hash']) k where snapshot->k='null'::jsonb) or
         coalesce(snapshot->>'created_at','')>e->>'timestamp' then raise exception 'invalid_word_proposal'; end if;
      if snapshot->>'contract_version'<>'ag70d.word-assignment.v1' or snapshot->>'selection_policy_version'<>'ag70d.word-selection.v2.1' or
         snapshot->>'timezone'<>'Asia/Kolkata' or snapshot->>'publication_scope'<>'global_public_word' or
         snapshot->>'identity_snapshot_ref'<>c.identity_snapshot_ref or
         coalesce(snapshot->>'date_key','') !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' or
         (snapshot->>'date_key')::date::text<>snapshot->>'date_key' or
         snapshot->'public_output_allowed' is distinct from 'false'::jsonb or snapshot->'runtime_activation' is distinct from 'false'::jsonb or
         (snapshot->>'history_revision')::bigint<>h.revision or snapshot->>'history_snapshot_ref'<>h.history_hash or
         proposal->>'proposal_id' is distinct from 'word-proposal:'||drishvara_word_private.content_hash(snapshot) or
         proposal->>'assignment_id' is distinct from e->>'assignment_id' or
         e->>'assignment_id'<>'word-assignment:'||drishvara_word_private.content_hash(to_jsonb(drishvara_word_private.canonical_json(jsonb_build_array('global_public_word',snapshot->>'date_key','Asia/Kolkata')))) or
         (claim.assignment_id is not null and claim.state<>'cancelled_reservation') then raise exception 'invalid_word_proposal'; end if;
      if coalesce(snapshot->>'created_at','') !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}Z$' or
         snapshot->>'canonical_lexical_identity_id' is distinct from record->>'canonical_lexical_identity_id' or
         snapshot->>'approved_record_version' is distinct from record->>'approved_record_version' or
         not(snapshot ?& array['context_version','canonical_context_basis_ref','context_snapshot_ref','precedence_version','precedence_rule_ref','bank_snapshot_ref','trace','source_evidence_refs','approval_record_refs']) then raise exception 'invalid_word_snapshot'; end if;
      if exists(select 1 from unnest(array['context_version','canonical_context_basis_ref','context_snapshot_ref','precedence_version','precedence_rule_ref','bank_snapshot_ref']) k where coalesce(length(snapshot->>k),0)=0) or
         jsonb_typeof(snapshot->'trace') is distinct from 'array' or jsonb_typeof(snapshot->'source_evidence_refs') is distinct from 'array' or
         jsonb_typeof(snapshot->'approval_record_refs') is distinct from 'array' then raise exception 'invalid_word_snapshot'; end if;
      perform (snapshot->>'created_at')::timestamptz;
      perform drishvara_word_private.require_reference(snapshot->>'canonical_context_basis_ref','context',snapshot->>'context_content_hash');
      perform drishvara_word_private.require_reference(snapshot->>'precedence_rule_ref','precedence',snapshot->>'precedence_content_hash');
      perform drishvara_word_private.require_reference(snapshot->>'identity_snapshot_ref','identity',snapshot->>'identity_content_hash');
      select ref_id into exclusion_ref from drishvara_word_private.versioned_references
        where kind='exclusions' and payload_hash=snapshot->>'exclusions_content_hash' and review_status='approved' order by ref_id limit 1;
      perform drishvara_word_private.require_reference(exclusion_ref,'exclusions',snapshot->>'exclusions_content_hash');
      insert into drishvara_word_private.assignment_snapshots values(proposal->>'proposal_id',e->>'assignment_id',snapshot,now());
    else
      if typ='reservation' then
        if n<>h.revision+2 or first_event->>'event_type'<>'selection_proposal' or not(e->'parent_event_refs' ? (first_event->>'event_id')) then raise exception 'invalid_word_reservation'; end if;
      else
        if claim.assignment_id is null or not(e->'parent_event_refs' ? claim.last_event_id) then raise exception 'word_target_conflict'; end if;
        select s.snapshot into snapshot from drishvara_word_private.assignment_snapshots s where s.proposal_id=claim.proposal_id;
        record := snapshot->'approved_record_snapshot';
        decision := drishvara_word_private.require_reference(e->>'decision_approval_ref','decision');
        if decision->>'proposal_id' is distinct from claim.proposal_id or decision->>'event_type' is distinct from typ then raise exception 'word_decision_target_mismatch'; end if;
        if not ((typ='authorized_assignment' and claim.state='reservation') or
                (typ='publication' and claim.state='authorized_assignment') or
                (typ='correction' and claim.state in ('publication','correction')) or
                (typ in ('withdrawal','supersession') and claim.state in ('authorized_assignment','publication','correction')) or
                (typ='cancelled_reservation' and claim.state='reservation')) then raise exception 'invalid_word_transition'; end if;
        if typ in ('publication','correction') and not c.publication_enabled then raise exception 'word_publication_not_activated'; end if;
        if typ='correction' then
          record := e->'corrected_record_snapshot';
          if e->>'corrects_event_id' is distinct from coalesce(case when claim.state='correction' then claim.last_event_id end,claim.publication_event_id) or
             decision->>'corrected_record_hash' is distinct from drishvara_word_private.content_hash(record) then raise exception 'invalid_word_correction'; end if;
        end if;
        if typ='supersession' and coalesce(length(e->>'supersession_ref'),0)=0 then raise exception 'missing_word_supersession_ref'; end if;
      end if;
    end if;
    if typ in ('selection_proposal','authorized_assignment','publication','correction') then
      authz := drishvara_word_private.require_reference(snapshot->>'canonical_context_basis_ref','context',snapshot->>'context_content_hash');
      if authz->>'version' is distinct from snapshot->>'context_version' or authz->>'snapshot_ref' is distinct from snapshot->>'context_snapshot_ref' then raise exception 'word_context_mismatch'; end if;
      if typ='correction' then
        -- A new corrected version needs its own approved date/context membership.
        authz := drishvara_word_private.require_reference(decision->>'corrected_context_ref','context',coalesce(decision->>'corrected_context_hash',''));
      end if;
      if authz->>'date_key' is distinct from snapshot->>'date_key' or
         not coalesce(authz->'eligible_candidate_refs' ? ((record->>'output_candidate_id')||'@'||(record->>'approved_record_version')),false) then raise exception 'word_context_mismatch'; end if;
      authz := drishvara_word_private.require_reference(snapshot->>'precedence_rule_ref','precedence',snapshot->>'precedence_content_hash');
      if authz->>'version' is distinct from snapshot->>'precedence_version' or authz->>'operator' is distinct from 'approved_explicit_candidate_order' then raise exception 'word_precedence_mismatch'; end if;
      select ref_id into exclusion_ref from drishvara_word_private.versioned_references
        where kind='exclusions' and payload_hash=snapshot->>'exclusions_content_hash' and review_status='approved' order by ref_id limit 1;
      perform drishvara_word_private.require_reference(exclusion_ref,'exclusions',snapshot->>'exclusions_content_hash');
      perform drishvara_word_private.require_reference((record->>'output_candidate_id')||'@'||(record->>'approved_record_version'),'candidate',drishvara_word_private.content_hash(record));
      if record->'production_approved' is distinct from 'true'::jsonb or record->'approved_for_daily_output' is distinct from 'true'::jsonb or
         record->>'review_status' is distinct from 'approved' or record->>'public_use_permission' is distinct from 'approved_for_output' or
         record->>'selection_path' is distinct from 'primary_lexical' or record->>'etymology_status' is distinct from 'established' or
         record->>'semantics_status' is distinct from 'supported' or coalesce(record->>'morphology_status','') not in ('established','review_approved') or
         jsonb_typeof(record->'source_evidence') is distinct from 'array' or coalesce(jsonb_array_length(record->'source_evidence'),0)=0 or
         jsonb_typeof(record->'approval_record_refs') is distinct from 'array' or coalesce(jsonb_array_length(record->'approval_record_refs'),0)=0 or
         record->'withdrawn'='true'::jsonb or record->'revoked'='true'::jsonb or record->'superseded'='true'::jsonb then raise exception 'word_record_not_approved'; end if;
      if exists(select 1 from unnest(array['withdrawn','revoked','superseded']) k where record ? k and jsonb_typeof(record->k)<>'boolean') then raise exception 'invalid_word_record_flags'; end if;
      for decision in select value from jsonb_array_elements(record->'source_evidence') loop
        if decision->>'review_status' is distinct from 'approved' then raise exception 'word_source_pending'; end if;
        perform drishvara_word_private.require_reference(decision->>'evidence_ref','source');
      end loop;
      for decision in select value from jsonb_array_elements(record->'approval_record_refs') loop
        perform drishvara_word_private.require_reference(decision #>> '{}','approval');
      end loop;
    end if;
    insert into drishvara_word_private.events values(e->>'event_id',n,e->>'command_id',e->>'assignment_id',e);
    if typ='reservation' then
      insert into drishvara_word_private.date_claims(assignment_id,publication_scope,date_key,timezone,proposal_id,last_event_id,state)
        values(e->>'assignment_id','global_public_word',(snapshot->>'date_key')::date,'Asia/Kolkata',proposal->>'proposal_id',e->>'event_id','reservation')
        on conflict(assignment_id) do update set proposal_id=excluded.proposal_id,last_event_id=excluded.last_event_id,state='reservation';
    elsif typ<>'selection_proposal' then
      update drishvara_word_private.date_claims set state=typ,last_event_id=e->>'event_id',
        publication_event_id=case when typ='publication' then e->>'event_id' else publication_event_id end where assignment_id=e->>'assignment_id';
    end if;
    if typ in ('reservation','correction') then
      foreach identity_field in array array['canonical_lexical_identity_id','lemma_id','equivalence_group_id'] loop
        if coalesce(length(record->>identity_field),0)=0 then raise exception 'word_identity_missing'; end if;
        if exists(select 1 from drishvara_word_private.identity_claims where kind=identity_field and value=record->>identity_field and assignment_id<>e->>'assignment_id') then raise exception 'word_identity_already_claimed'; end if;
        insert into drishvara_word_private.identity_claims values(identity_field,record->>identity_field,e->>'assignment_id') on conflict do nothing;
      end loop;
    elsif typ='cancelled_reservation' then
      delete from drishvara_word_private.identity_claims where assignment_id=e->>'assignment_id';
    end if;
    last_time := e->>'timestamp';
  end loop;
  select coalesce(jsonb_agg(payload order by sequence),'[]'::jsonb) into all_events from drishvara_word_private.events;
  update drishvara_word_private.ledger_head set revision=n,history_hash=drishvara_word_private.content_hash(all_events) where singleton;
  receipt := jsonb_build_object('status','committed','idempotency_key',key,'request_hash',request_hash,
    'event_ids',(select jsonb_agg(value->'event_id') from jsonb_array_elements(p_request->'events')),
    'history_snapshot_ref',drishvara_word_private.content_hash(all_events),'public_output_allowed',false,'runtime_activation',false);
  insert into drishvara_word_private.command_receipts values(key,request_hash,receipt);
  return receipt;
exception when unique_violation then
  -- PL/pgSQL rolls back the entire block before returning this governed conflict.
  return jsonb_build_object('status','conflict','public_output_allowed',false,'runtime_activation',false);
end $$;

revoke all on all functions in schema drishvara_word_private from public, anon, authenticated, service_role;
revoke all on function public.word_assignment_read_history() from public, anon, authenticated;
revoke all on function public.word_assignment_read_command(text) from public, anon, authenticated;
revoke all on function public.word_assignment_commit(jsonb) from public, anon, authenticated;
grant execute on function public.word_assignment_read_history(), public.word_assignment_read_command(text), public.word_assignment_commit(jsonb) to service_role;
commit;

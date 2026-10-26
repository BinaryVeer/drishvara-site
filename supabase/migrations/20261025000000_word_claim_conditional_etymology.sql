-- Preparation only. Apply only after separate hosted migration authorization.
-- No content, approval references, controls, grants or schedules are activated.
begin;
create or replace function drishvara_word_private.valid_word_etymology(r jsonb) returns boolean
language plpgsql stable set search_path = pg_catalog, drishvara_word_private as $$
declare q jsonb; cp jsonb; item jsonb; matched integer; hash text;
begin
  if not (r ? 'minimum_publication_contract') then return r->>'etymology_status' is not distinct from 'established'; end if;
  q:=r->'minimum_publication_contract'; cp:=r->'reviewed_publication_copy';
  if jsonb_typeof(q) is distinct from 'object' or
    q->>'contract_version' is distinct from 'ag70e.word-minimum-publication.v2' or
    q->>'policy_ref' is distinct from 'drishvara-word-minimum-policy@2' or
    q->>'policy_approval_ref' is distinct from 'drishvara-publisher-semantic-only-20261025-v1' or
    jsonb_typeof(q->'etymological_claim_displayed') is distinct from 'boolean' or
    jsonb_typeof(q->'claim_evidence_refs') is distinct from 'array' or
    jsonb_typeof(q->'claim_review_ref') is distinct from 'string' or
    jsonb_typeof(r->'approval_record_refs') is distinct from 'array' or
    jsonb_typeof(cp->'content') is distinct from 'object' or jsonb_typeof(cp->'reviews') is distinct from 'array' then return false; end if;
  if exists(select 1 from jsonb_object_keys(q) k where k not in
    ('contract_version','policy_ref','policy_approval_ref','copy_content_hash','etymological_claim_displayed','claim_review_ref','claim_evidence_refs')) then return false; end if;
  if coalesce(length(q->>'claim_review_ref'),0)=0 or btrim(q->>'claim_review_ref') is distinct from q->>'claim_review_ref' or
    not (r->'approval_record_refs' ? (q->>'claim_review_ref')) then return false; end if;
  hash:=drishvara_word_private.content_hash(cp->'content');
  if q->>'copy_content_hash' is distinct from hash then return false; end if;
  select count(*) into matched from jsonb_array_elements(cp->'reviews') v
    where v->>'kind'='linguistic' and v->>'review_status'='approved' and v->>'content_hash'=hash and jsonb_typeof(v->'approval_ref')='string' and
      v->>'approval_ref'=q->>'claim_review_ref';
  if matched<>1 then return false; end if;
  -- Local policy metadata alone is not managed authorization: require the exact immutable registry payload.
  perform drishvara_word_private.require_reference('drishvara-word-minimum-policy@2','approval',
    'sha256:5e23851d6db93b2d5348b7808f362f953f2ce13f332aa612ce0e5ba832101904');
  if q->'etymological_claim_displayed'='false'::jsonb then
    return coalesce(r->>'etymology_status','') in ('not_claimed','established') and jsonb_array_length(q->'claim_evidence_refs')=0;
  end if;
  if r->>'etymology_status' is distinct from 'established' or jsonb_array_length(q->'claim_evidence_refs')=0 or
    jsonb_typeof(r->'source_evidence') is distinct from 'array' then return false; end if;
  for item in select value from jsonb_array_elements(q->'claim_evidence_refs') loop
    if jsonb_typeof(item) is distinct from 'string' or length(btrim(item #>> '{}'))=0 or
      not exists(select 1 from jsonb_array_elements(r->'source_evidence') e
        where e->>'evidence_ref'=item #>> '{}' and e->>'review_status'='approved') then return false; end if;
  end loop;
  return true;
exception when others then return false;
end $$;
revoke all on function drishvara_word_private.valid_word_etymology(jsonb) from public, anon, authenticated, service_role;

-- Replace one bounded guard in the installed RPC, not its transaction/history implementation.
-- Refuse an unexpected provider definition rather than guessing at a reconciliation.
do $$
declare definition text; old_guard text := 'record->>''etymology_status'' is distinct from ''established''';
  new_guard text := 'not drishvara_word_private.valid_word_etymology(record)';
begin
  definition:=pg_get_functiondef('public.word_assignment_commit(jsonb)'::regprocedure);
  if (length(definition)-length(replace(definition,old_guard,'')))/length(old_guard)=1 and position(new_guard in definition)=0 then
    execute replace(definition,old_guard,new_guard);
  elsif position(old_guard in definition)=0 and (length(definition)-length(replace(definition,new_guard,'')))/length(new_guard)=1 then
    null;
  else raise exception 'word_etymology_migration_definition_mismatch'; end if;
end $$;
commit;

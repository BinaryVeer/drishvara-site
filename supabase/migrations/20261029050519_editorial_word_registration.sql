-- Guarded registration only. No content decisions, registry records or publication controls are seeded.
begin;
create function drishvara_editorial_private.put_word_reference(p_ref text,p_kind text,p_payload jsonb,p_actor uuid,p_approval text) returns void
language plpgsql set search_path=pg_catalog as $$
begin
 if coalesce(length(btrim(p_ref)),0) not between 1 and 500 then raise exception 'invalid_word_reference'; end if;
 insert into drishvara_word_private.versioned_references(ref_id,kind,version,payload,review_status,reviewer_id,approval_ref)
 values(p_ref,p_kind,'1',p_payload,'approved',p_actor::text,p_approval) on conflict do nothing;
 perform drishvara_word_private.require_reference(p_ref,p_kind,drishvara_word_private.content_hash(p_payload));
end;
$$;

-- A registered review must remain valid after edits, new decisions or role revocation.
do $$
begin
 if (select md5(prosrc) from pg_proc where oid='drishvara_word_private.require_reference(text,text,text)'::regprocedure)
   is distinct from '3211706afe201c50988e7930f1a9b108' then raise exception 'word_reference_definition_mismatch'; end if;
end;
$$;
create or replace function drishvara_word_private.require_reference(p_ref text,p_kind text,p_hash text default null) returns jsonb
language plpgsql stable set search_path=pg_catalog,drishvara_word_private as $$
declare r drishvara_word_private.versioned_references; b jsonb; c drishvara_editorial_private.candidates; v drishvara_editorial_private.versions; state jsonb;
begin
 select * into r from drishvara_word_private.versioned_references where ref_id=p_ref and kind=p_kind and review_status='approved';
 if not found or exists(select 1 from drishvara_word_private.reference_revocations where ref_id=p_ref) or
 (p_hash is not null and r.payload_hash<>p_hash) then raise exception 'word_reference_unapproved'; end if;
 if r.payload ? 'editorial_binding' then
  b:=r.payload->'editorial_binding';
  select * into c from drishvara_editorial_private.candidates where id=(b->>'candidate_id')::uuid and kind='word';
  if not found or c.current_version_id is distinct from (b->>'version_id')::uuid then raise exception 'word_editorial_approval_changed'; end if;
  select * into v from drishvara_editorial_private.versions where id=c.current_version_id;
  state:=drishvara_editorial_private.review_state(c.id,v.id);
  if v.content_hash is distinct from b->>'content_hash' or state->'reviews_complete' is distinct from 'true'::jsonb
   or state->'decision_refs' is distinct from b->'decision_refs'
   or not drishvara_editorial_private.is_administrator((b->>'registrar_id')::uuid)
   or not exists(select 1 from drishvara_editorial_private.administrators where subject_id=(b->>'registrar_id')::uuid and authorization_ref=b->>'registration_authorization_ref') then
   raise exception 'word_editorial_approval_changed'; end if;
 end if;
 return r.payload;
end;
$$;

create function public.editorial_word_registration(p_command jsonb) returns jsonb
language plpgsql security definer set search_path=pg_catalog as $$
declare
 actor uuid:=auth.uid(); op text:=p_command->>'action'; keys text[]; k text; v_command_id uuid;
 c drishvara_editorial_private.candidates; v drishvara_editorial_private.versions; saved drishvara_editorial_private.commands;
 state jsonb; meta jsonb; binding jsonb; decisions jsonb; d jsonb; refs jsonb; reviews jsonb; content jsonb; cp jsonb; record jsonb;
 source jsonb; rights jsonb; linguistic jsonb; reuse text; ref text; result jsonb; record_hash text; hash text; auth_ref text;
begin
 perform pg_advisory_xact_lock(hashtextextended('editorial-access-administration',0));
 if actor is null or not drishvara_editorial_private.is_administrator(actor) then raise exception 'workspace_administrator_required'; end if;
 keys:=array['action','command_id','candidate_id','version_id','content_hash','metadata','note']||case when op='register' then array['expected_record_hash'] else '{}'::text[] end;
 if op not in ('prepare','register') or jsonb_typeof(p_command) is distinct from 'object' or octet_length(p_command::text)>12000
  or not(p_command ?& keys) or exists(select 1 from jsonb_object_keys(p_command) x where x<>all(keys)) then raise exception 'invalid_word_registration'; end if;
 v_command_id:=(p_command->>'command_id')::uuid;
 if v_command_id is null or jsonb_typeof(p_command->'note') is distinct from 'string' or length(btrim(p_command->>'note')) not between 12 and 6000 then raise exception 'word_registration_metadata_pending'; end if;
 meta:=p_command->'metadata';
 keys:=array['canonical_lexical_identity_id','lemma_id','equivalence_group_id','context_signal_id','no_etymological_claim'];
 if jsonb_typeof(meta) is distinct from 'object' or not(meta ?& keys) or exists(select 1 from jsonb_object_keys(meta) x where x<>all(keys))
  or meta->'no_etymological_claim' is distinct from 'true'::jsonb then raise exception 'word_registration_metadata_pending'; end if;
 foreach k in array array['canonical_lexical_identity_id','lemma_id','equivalence_group_id','context_signal_id'] loop
  if jsonb_typeof(meta->k) is distinct from 'string' or (meta->>k) !~ '^[a-zA-Z0-9][a-zA-Z0-9._:@/-]{0,199}$' then raise exception 'word_registration_metadata_pending'; end if;
 end loop;
 select * into c from drishvara_editorial_private.candidates where id=(p_command->>'candidate_id')::uuid and kind='word' for update;
 if not found then raise exception 'invalid_word_registration'; end if;
 select * into v from drishvara_editorial_private.versions where id=c.current_version_id;
 if v.id is distinct from (p_command->>'version_id')::uuid or v.content_hash is distinct from p_command->>'content_hash' then raise exception 'stale_editorial_version'; end if;
 state:=drishvara_editorial_private.review_state(c.id,v.id);
 if state->'reviews_complete' is distinct from 'true'::jsonb then raise exception 'editorial_reviews_pending'; end if;
 select jsonb_agg(to_jsonb(x) order by x.scope) into decisions from drishvara_editorial_private.decisions x where state->'decision_refs' ? x.id::text;
 if jsonb_array_length(decisions)<>9 then raise exception 'editorial_reviews_pending'; end if;
 content:=v.payload->'content'; hash:=drishvara_word_private.content_hash(content);
 select x into rights from jsonb_array_elements(decisions)x where x->>'scope'='rights';
 select x into linguistic from jsonb_array_elements(decisions)x where x->>'scope'='linguistic';
 if v.payload->>'contract_version' is distinct from 'ag70e.word-copy.v2' then raise exception 'word_registration_copy_unapproved'; end if;
 perform drishvara_word_private.assert_meaning_structure(content);
 if jsonb_typeof(content->'sources') is distinct from 'array' or jsonb_array_length(content->'sources')=0 then raise exception 'word_registration_sources_pending'; end if;
 for source in select value from jsonb_array_elements(content->'sources') loop
  if source->>'review_status' is distinct from 'approved' or not(rights->'evidence_refs' ? (source->>'reuse_approval_ref'))
   or not(rights->'evidence_refs' ? (source->>'evidence_ref')) then raise exception 'word_registration_sources_pending'; end if;
 end loop;
 select authorization_ref into auth_ref from drishvara_editorial_private.administrators where subject_id=actor;
 binding:=jsonb_build_object('candidate_id',c.id,'version_id',v.id,'content_hash',v.content_hash,'decision_refs',state->'decision_refs',
  'registrar_id',actor,'registration_authorization_ref',auth_ref);
 select jsonb_agg('editorial-decision:'||(x->>'id') order by x->>'scope'),
  jsonb_agg(jsonb_build_object('kind',x->>'scope','review_status','approved','approval_ref','editorial-decision:'||(x->>'id'),'content_hash',hash) order by x->>'scope')
   filter(where x->>'scope' not in ('iast','publisher_acceptance')) into refs,reviews from jsonb_array_elements(decisions)x;
 select 'editorial-decision:'||(x->>'id') into ref from jsonb_array_elements(decisions)x where x->>'scope'='iast';
 cp:=jsonb_build_object('contract_version','ag70e.word-copy.v2','version',v.id,'content',content,'reviews',reviews,
  'iast_review_status',case when content->'iast'='null'::jsonb then null else 'approved' end,
  'iast_approval_ref',case when content->'iast'='null'::jsonb then null else ref end);
 record:=jsonb_build_object('output_candidate_id','editorial-word:'||c.id,'selected_word_id',c.external_id,'approved_record_version',v.id,
  'canonical_lexical_identity_id',meta->>'canonical_lexical_identity_id','lemma_id',meta->>'lemma_id','equivalence_group_id',meta->>'equivalence_group_id',
  'context_signal_id',meta->>'context_signal_id','selection_path','primary_lexical','production_approved',true,'approved_for_daily_output',true,
  'review_status','approved','public_use_permission','approved_for_output','morphology_status','review_approved','semantics_status','supported','etymology_status','not_claimed',
  'approval_record_refs',refs,'source_evidence',(select jsonb_agg(jsonb_build_object('evidence_ref',s->>'evidence_ref','review_status','approved') order by s->>'evidence_ref') from jsonb_array_elements(content->'sources')s),
  'reviewed_publication_copy',cp,'minimum_publication_contract',jsonb_build_object('contract_version','ag70e.word-minimum-publication.v2',
  'policy_ref','drishvara-word-minimum-policy@2','policy_approval_ref','drishvara-publisher-semantic-only-20261025-v1','copy_content_hash',hash,
  'etymological_claim_displayed',false,'claim_review_ref','editorial-decision:'||(linguistic->>'id'),'claim_evidence_refs','[]'::jsonb),'editorial_binding',binding);
 record_hash:=drishvara_word_private.content_hash(record); ref:=(record->>'output_candidate_id')||'@'||(record->>'approved_record_version');
 if op='prepare' then return jsonb_build_object('ok',true,'record',record,'record_hash',record_hash,'public_output_allowed',false,'runtime_activation',false); end if;
 if jsonb_typeof(p_command->'expected_record_hash') is distinct from 'string' or p_command->>'expected_record_hash'<>record_hash then raise exception 'word_registration_changed'; end if;
 -- Serialize registry inserts and mappings; never replace immutable prior references.
 perform pg_advisory_xact_lock(hashtextextended('editorial-word-registration',0));
 select * into saved from drishvara_editorial_private.commands where actor_id=actor and command_id=v_command_id;
 if found then
  if saved.request<>p_command then raise exception 'idempotency_conflict'; end if;
  perform drishvara_word_private.require_reference(ref,'candidate',record_hash); return saved.receipt;
 end if;
 for d in select value from jsonb_array_elements(decisions) loop
  perform drishvara_editorial_private.put_word_reference('editorial-decision:'||(d->>'id'),'approval',
   jsonb_build_object('review_decision',d,'editorial_binding',binding),actor,'editorial-decision:'||(d->>'id'));
 end loop;
 for source in select value from jsonb_array_elements(content->'sources') loop
  reuse:=source->>'reuse_approval_ref';
  perform drishvara_editorial_private.put_word_reference(reuse,'approval',
   jsonb_build_object('source_use_ref',reuse,'rights_decision_id',rights->>'id','evidence_refs',rights->'evidence_refs','editorial_binding',binding),actor,'editorial-decision:'||(rights->>'id'));
  perform drishvara_editorial_private.put_word_reference(source->>'evidence_ref','source',
   jsonb_build_object('source',source,'editorial_binding',binding),actor,'editorial-decision:'||(rights->>'id'));
 end loop;
 perform drishvara_editorial_private.put_word_reference(ref,'candidate',record,actor,'editorial-decision:'||(select x->>'id' from jsonb_array_elements(decisions)x where x->>'scope'='publisher_acceptance'));
 perform drishvara_word_private.assert_standing_copy(record);
 if not drishvara_word_private.valid_word_etymology(record) then raise exception 'word_registration_copy_unapproved'; end if;
 update drishvara_editorial_private.delivery_controls set word_record_refs=jsonb_set(word_record_refs,array[c.id::text],to_jsonb(ref)) where singleton;
 result:=jsonb_build_object('ok',true,'status','approved_bank_registered','candidate_ref',ref,'record_hash',record_hash,'public_output_allowed',false,'runtime_activation',false);
 insert into drishvara_editorial_private.commands values(actor,v_command_id,p_command,result);
 insert into drishvara_editorial_private.administration_events(id,actor_id,subject_id,action,request) values(v_command_id,actor,actor,'register_word',p_command);
 return result;
end;
$$;

create function public.editorial_registered_word(p_ref text) returns jsonb
language sql security definer set search_path=pg_catalog as $$
 select drishvara_word_private.require_reference(p_ref,'candidate');
$$;
create function public.editorial_word_registration_state(p_candidate_id uuid) returns jsonb
language plpgsql security definer set search_path=pg_catalog as $$
declare actor uuid:=auth.uid(); ref text; record jsonb;
begin
 if actor is null or not exists(select 1 from public.profiles where id=actor and is_active=true)
  or not drishvara_editorial_private.can_read(actor,p_candidate_id)
  or not drishvara_editorial_private.has_capability(actor,'word','release')
  or not exists(select 1 from drishvara_editorial_private.candidates where id=p_candidate_id and kind='word') then raise exception 'release_scope_denied'; end if;
 select word_record_refs->>p_candidate_id::text into ref from drishvara_editorial_private.delivery_controls where singleton;
 begin
  record:=drishvara_word_private.require_reference(ref,'candidate');
 exception when others then record:=null; end;
 return jsonb_build_object('ok',true,'registered',record is not null,'public_output_allowed',false,'runtime_activation',false);
end;
$$;
revoke all on function drishvara_editorial_private.put_word_reference(text,text,jsonb,uuid,text) from public,anon,authenticated,service_role;
revoke all on function public.editorial_word_registration(jsonb) from public,anon,service_role;
grant execute on function public.editorial_word_registration(jsonb) to authenticated;
revoke all on function public.editorial_registered_word(text) from public,anon,authenticated;
grant execute on function public.editorial_registered_word(text) to service_role;
revoke all on function public.editorial_word_registration_state(uuid) from public,anon,service_role;
grant execute on function public.editorial_word_registration_state(uuid) to authenticated;
commit;

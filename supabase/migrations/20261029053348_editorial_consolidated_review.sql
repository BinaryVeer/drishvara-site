-- Consolidated human checklist; immutable scope decisions and publication gates are retained.
begin;
create function drishvara_editorial_private.can_revise(p_actor uuid,p_candidate uuid) returns boolean
language sql stable set search_path=pg_catalog as $$
 select coalesce(drishvara_editorial_private.can_read(p_actor,c.id) and
   (drishvara_editorial_private.has_capability(p_actor,c.kind,'intake') or
    ((drishvara_editorial_private.is_administrator(p_actor) or exists(select 1 from drishvara_editorial_private.assignments a
      where a.candidate_id=c.id and a.subject_id=p_actor and a.revoked_at is null and a.expires_at>now())) and
     exists(select 1 from unnest(array['release']||drishvara_editorial_private.scopes(c.kind)) s
       where drishvara_editorial_private.has_capability(p_actor,c.kind,s)))),false)
 from drishvara_editorial_private.candidates c where c.id=p_candidate;
$$;

-- Retain the installed command implementation privately, with revision-only access for assigned staff.
do $$
declare definition text; old_text text; new_text text;
begin
 definition:=pg_get_functiondef('public.editorial_review_command(jsonb)'::regprocedure);
 if md5(definition)<>'b1dd5efda5cbea693ad8b2773791f718' then raise exception 'editorial_review_definition_mismatch'; end if;
 definition:=replace(definition,'FUNCTION public.editorial_review_command(',
  'FUNCTION drishvara_editorial_private.review_command_v1(');
 old_text:='''can_edit'',drishvara_editorial_private.has_capability(actor,c.kind,''intake'')';
 new_text:='''can_edit'',drishvara_editorial_private.can_revise(actor,c.id)';
 if position(old_text in definition)=0 then raise exception 'editorial_revision_definition_mismatch'; end if;
 definition:=replace(definition,old_text,new_text);
 old_text:='if not drishvara_editorial_private.has_capability(actor,p_command->>''kind'',''intake'') then';
 new_text:='if not drishvara_editorial_private.has_capability(actor,p_command->>''kind'',''intake'') and not exists
  (select 1 from drishvara_editorial_private.candidates existing where existing.kind=p_command->>''kind''
   and existing.external_id=p_command->>''external_id'' and existing.current_version_id=(p_command->>''expected_version_id'')::uuid
   and drishvara_editorial_private.can_revise(actor,existing.id)) then';
 if position(old_text in definition)=0 then raise exception 'editorial_revision_definition_mismatch'; end if;
 execute replace(definition,old_text,new_text);
end;
$$;

create function drishvara_editorial_private.validate_image_uploads(p_media jsonb) returns void
language plpgsql set search_path=pg_catalog as $$
declare m jsonb; b bytea; w bigint; h bigint; ratio double precision;
begin
 if jsonb_typeof(p_media) is distinct from 'array' or jsonb_array_length(p_media)>1 then raise exception 'invalid_editorial_image'; end if;
 for m in select value from jsonb_array_elements(p_media) loop
  if not(m ? 'upload_png') then continue; end if;
  if jsonb_typeof(m)<>'object' or not(m ?& array['url','alt','attribution','source_url','upload_png']) or
   exists(select 1 from jsonb_object_keys(m) k where k<>all(array['url','alt','attribution','source_url','upload_png'])) or
   exists(select 1 from jsonb_each(m) e where jsonb_typeof(e.value)<>'string') or
   length(trim(m->>'alt')) not between 1 and 2000 or length(trim(m->>'attribution')) not between 1 and 2000 or
   m->>'source_url' !~ '^https://[^/@?#]+([/?#].*)?$' then raise exception 'invalid_editorial_image'; end if;
  b:=decode(m->>'upload_png','base64');
  if octet_length(b) not between 45 and 98304 or
    replace(encode(b,'base64'),E'\n','')<>m->>'upload_png' or
    encode(substring(b from 1 for 16),'hex')<>'89504e470d0a1a0a0000000d49484452' or
    encode(substring(b from octet_length(b)-7 for 4),'hex')<>'49454e44' then raise exception 'invalid_editorial_image'; end if;
  w:=get_byte(b,16)::bigint*16777216+get_byte(b,17)*65536+get_byte(b,18)*256+get_byte(b,19);
  h:=get_byte(b,20)::bigint*16777216+get_byte(b,21)*65536+get_byte(b,22)*256+get_byte(b,23);
  if w not between 320 and 2400 or h not between 180 and 1800 then raise exception 'invalid_editorial_image'; end if;
  ratio:=w::double precision/h;
  if least(abs(ratio-16.0/9),abs(ratio-4.0/3))>=0.015 or
    m->>'url'<>'/assets/editorial/'||encode(sha256(b),'hex')||'.png' then raise exception 'invalid_editorial_image'; end if;
 end loop;
exception when invalid_parameter_value or invalid_text_representation then raise exception 'invalid_editorial_image';
end;
$$;

create or replace function public.editorial_review_command(p_command jsonb) returns jsonb
language plpgsql security definer set search_path=pg_catalog as $$
declare actor uuid:=auth.uid(); saved drishvara_editorial_private.commands%rowtype;
 one jsonb; result jsonb; receipts jsonb:='[]'; scope text; batch_id uuid; keys text[];
 snapshot jsonb; subject_needed boolean;
begin
 if jsonb_typeof(p_command) is distinct from 'object' or octet_length(p_command::text)>240000 then raise exception 'invalid_editorial_command'; end if;
 if p_command->>'action'<>'review_batch' then
  if p_command->>'action'='intake' and p_command->>'kind'='article' then
   perform drishvara_editorial_private.validate_image_uploads(p_command->'payload'->'media');
  end if;
  return drishvara_editorial_private.review_command_v1(p_command);
 end if;
 keys:=array['action','command_id','candidate_id','version_id','content_hash','scopes','decision','note','evidence_refs'];
 if p_command ? 'admin_exception' then keys:=keys||array['admin_exception']; end if;
 if p_command ? 'subject_review_exception' then keys:=keys||array['subject_review_exception']; end if;
 if jsonb_typeof(p_command) is distinct from 'object' or octet_length(p_command::text)>240000 or not(p_command ?& keys) or
  exists(select 1 from jsonb_object_keys(p_command) k where not(k=any(keys))) or
  jsonb_typeof(p_command->'scopes') is distinct from 'array' then raise exception 'invalid_review_checklist'; end if;
 if jsonb_array_length(p_command->'scopes') not between 1 and 8 or
  exists(select 1 from jsonb_array_elements(p_command->'scopes') s where jsonb_typeof(s)<>'string' or s#>>'{}'='publisher_acceptance') or
  (select count(*)<>count(distinct s) from jsonb_array_elements(p_command->'scopes') s) then raise exception 'invalid_review_checklist'; end if;
 -- Authentication, assignments and revocations are always checked, even for a replay.
 snapshot:=drishvara_editorial_private.review_command_v1(jsonb_build_object('action','open','candidate_id',p_command->>'candidate_id'));
 batch_id:=(p_command->>'command_id')::uuid;
 if batch_id is null then raise exception 'invalid_review_checklist'; end if;
 perform pg_advisory_xact_lock(hashtextextended('editorial-access-administration',0));
 perform pg_advisory_xact_lock(hashtextextended(actor::text||batch_id::text,0));
 select * into saved from drishvara_editorial_private.commands where actor_id=actor and command_id=batch_id;
 if found then
  if saved.request<>p_command then raise exception 'idempotency_conflict'; end if;
  return saved.receipt;
 end if;
 subject_needed:=exists(select 1 from jsonb_array_elements_text(p_command->'scopes') s
  where s=any(drishvara_editorial_private.admin_subject_scopes(actor,snapshot->'candidate'->>'kind')));
 if p_command ? 'subject_review_exception' and not subject_needed then raise exception 'unexpected_subject_review_exception'; end if;
 for scope in select value from jsonb_array_elements_text(p_command->'scopes') order by value loop
  one:=(p_command-'scopes'-'subject_review_exception')||jsonb_build_object('action','decision','command_id',gen_random_uuid(),'scope',scope);
  if scope=any(drishvara_editorial_private.admin_subject_scopes(actor,snapshot->'candidate'->>'kind')) and p_command ? 'subject_review_exception' then
   one:=one||jsonb_build_object('subject_review_exception',p_command->'subject_review_exception');
  end if;
  result:=drishvara_editorial_private.review_command_v1(one);
  receipts:=receipts||jsonb_build_array(result->'decision_id');
 end loop;
 result:=jsonb_build_object('ok',true,'decision_ids',receipts,'review_state',result->'review_state',
  'public_output_allowed',false,'runtime_activation',false);
 insert into drishvara_editorial_private.commands values(actor,batch_id,p_command,result);
 return result;
end;
$$;
revoke all on function drishvara_editorial_private.review_command_v1(jsonb),
 drishvara_editorial_private.can_revise(uuid,uuid),drishvara_editorial_private.validate_image_uploads(jsonb) from public,anon,authenticated,service_role;
revoke all on function public.editorial_review_command(jsonb) from public,anon,service_role;
grant execute on function public.editorial_review_command(jsonb) to authenticated;
commit;

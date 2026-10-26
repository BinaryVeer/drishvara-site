-- PREPARED ONLY. Extends copy validation; never seeds content or enables controls.
-- Requires the existing standing-policy migration. Apply only with authorization.
begin;

create or replace function drishvara_word_private.meaning_exact_keys(v jsonb, keys text[]) returns boolean
language sql immutable set search_path = pg_catalog as $$
  select case when jsonb_typeof(v)='object' then v ?& keys and
    (select count(*) from jsonb_object_keys(v))=cardinality(keys) else false end;
$$;
create or replace function drishvara_word_private.meaning_text_fields(v jsonb, keys text[]) returns boolean
language sql immutable set search_path = pg_catalog as $$
  select not exists(select 1 from unnest(keys) k where jsonb_typeof(v->k) is distinct from 'string'
    or length(btrim(v->>k))=0 or length(v->>k)>30000);
$$;
create or replace function drishvara_word_private.assert_meaning_structure(c jsonb) returns void
language plpgsql stable set search_path = pg_catalog, drishvara_word_private as $$
declare d jsonb; e jsonb; p jsonb; s jsonb; item jsonb; ref text; fields text[];
begin
  if not drishvara_word_private.meaning_exact_keys(c,array['english','hindi','sanskrit','iast','meaning_en','meaning_hi','reflection_en','reflection_hi','sources','meaning_details']) then raise exception 'word_meaning_structure_invalid'; end if;
  d:=c->'meaning_details';
  if not drishvara_word_private.meaning_exact_keys(d,array['contract_version','explanation_en','explanation_hi','method_summary_en','method_summary_hi','scriptural_references','philosophical_essay']) or
     d->>'contract_version' is distinct from 'ag70e.word-meaning.v1' or
     not drishvara_word_private.meaning_text_fields(d,array['explanation_en','explanation_hi','method_summary_en','method_summary_hi']) or
     cardinality(regexp_split_to_array(btrim(d->>'method_summary_en'),'[[:space:]]+')) not in (7,8) then raise exception 'word_meaning_structure_invalid'; end if;
  if jsonb_typeof(c->'sources') is distinct from 'array' or jsonb_array_length(c->'sources') not between 1 and 24 or
     (select count(distinct v->>'evidence_ref') from jsonb_array_elements(c->'sources') v)<>jsonb_array_length(c->'sources') then raise exception 'word_meaning_structure_invalid'; end if;
  for item in select value from jsonb_array_elements(c->'sources') loop
    if not drishvara_word_private.meaning_exact_keys(item,array['evidence_ref','title','publisher','url','attribution','reuse_approval_ref','review_status','source_kind']) or
       coalesce(item->>'source_kind','') not in ('lexical_dictionary','scriptural_text','commentary','secondary_scholarship') then raise exception 'word_meaning_structure_invalid'; end if;
  end loop;
  if jsonb_typeof(d->'scriptural_references') is distinct from 'array' or jsonb_array_length(d->'scriptural_references') not between 1 and 24 or
     (select count(distinct v->>'evidence_ref') from jsonb_array_elements(d->'scriptural_references') v)<>jsonb_array_length(d->'scriptural_references') then raise exception 'word_meaning_structure_invalid'; end if;
  fields:=array['evidence_ref','work','locator','edition','original_text','original_language','matched_form','relation','translation_en','translation_hi','scope_note_en','scope_note_hi'];
  for p in select value from jsonb_array_elements(d->'scriptural_references') loop
    if not drishvara_word_private.meaning_exact_keys(p,fields) or not drishvara_word_private.meaning_text_fields(p,fields) or
       coalesce(p->>'relation','') not in ('direct_word_attestation','conceptual_parallel') or strpos(p->>'original_text',p->>'matched_form')=0 or
       not exists(select 1 from jsonb_array_elements(c->'sources') v where v->>'evidence_ref'=p->>'evidence_ref' and v->>'source_kind'='scriptural_text') then raise exception 'word_meaning_structure_invalid'; end if;
  end loop;
  e:=d->'philosophical_essay';
  if not drishvara_word_private.meaning_exact_keys(e,array['kind','tradition_scope_en','tradition_scope_hi','sections']) or e->>'kind' is distinct from 'original_editorial_interpretation' or
     not drishvara_word_private.meaning_text_fields(e,array['tradition_scope_en','tradition_scope_hi']) or
     jsonb_typeof(e->'sections') is distinct from 'array' or jsonb_array_length(e->'sections') not between 1 and 24 then raise exception 'word_meaning_structure_invalid'; end if;
  for s in select value from jsonb_array_elements(e->'sections') loop
    if not drishvara_word_private.meaning_exact_keys(s,array['heading_en','heading_hi','body_en','body_hi','evidence_refs']) or
       not drishvara_word_private.meaning_text_fields(s,array['heading_en','heading_hi','body_en','body_hi']) or
       jsonb_typeof(s->'evidence_refs') is distinct from 'array' or jsonb_array_length(s->'evidence_refs') not between 1 and 24 or
       (select count(distinct v) from jsonb_array_elements(s->'evidence_refs') v)<>jsonb_array_length(s->'evidence_refs') then raise exception 'word_meaning_structure_invalid'; end if;
    for item in select value from jsonb_array_elements(s->'evidence_refs') loop
      if jsonb_typeof(item) is distinct from 'string' then raise exception 'word_meaning_structure_invalid'; end if;
      ref:=item#>>'{}';
      if length(btrim(ref))=0 or not exists(select 1 from jsonb_array_elements(c->'sources') v where v->>'evidence_ref'=ref) then raise exception 'word_meaning_structure_invalid'; end if;
    end loop;
  end loop;
end $$;

-- Patch only the version/extra-review guard. Existing source/rights/registry,
-- transaction, revocation and publication checks retain their original owner.
do $$
declare def text; old_version text; old_reviews text; marker text;
begin
  def:=pg_get_functiondef('drishvara_word_private.assert_standing_copy(jsonb)'::regprocedure);
  old_version:='cp->>''contract_version'' is distinct from ''ag70e.word-copy.v1''';
  old_reviews:='foreach k in array array[''linguistic'',''editorial'',''rights'',''context'',''safety''] loop';
  marker:='perform drishvara_word_private.assert_meaning_structure(content);';
  if strpos(def,marker)>0 then
    if (length(def)-length(replace(def,marker,'')))/length(marker)<>1 then raise exception 'word_meaning_migration_definition_mismatch'; end if;
  else
    if (length(def)-length(replace(def,old_version,'')))/length(old_version)<>1 or
       (length(def)-length(replace(def,old_reviews,'')))/length(old_reviews)<>1 then raise exception 'word_meaning_migration_definition_mismatch'; end if;
    def:=replace(def,old_version,'coalesce(cp->>''contract_version'','''') not in (''ag70e.word-copy.v1'',''ag70e.word-copy.v2'')');
    def:=replace(def,old_reviews,'if cp->>''contract_version''=''ag70e.word-copy.v2'' then '||marker||' end if; '||
      'foreach k in array case when cp->>''contract_version''=''ag70e.word-copy.v2'' then array[''linguistic'',''editorial'',''rights'',''context'',''safety'',''textual'',''philosophical''] else array[''linguistic'',''editorial'',''rights'',''context'',''safety''] end loop');
    execute def;
  end if;
end $$;
revoke all on function drishvara_word_private.meaning_exact_keys(jsonb,text[]),
  drishvara_word_private.meaning_text_fields(jsonb,text[]),drishvara_word_private.assert_meaning_structure(jsonb)
  from public,anon,authenticated,service_role;
commit;

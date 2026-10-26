import {gunzipSync} from 'node:zlib';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
const path='data/location-releases/lgd-hq-20261026.json.gz';
const raw=gunzipSync(fs.readFileSync(path)).toString('utf8'), release=JSON.parse(raw);
const review=JSON.parse(fs.readFileSync('data/location-releases/lgd-hq-20261026-review.json'));
const sha=crypto.createHash('sha256').update(raw).digest('hex');
if(sha!==review.payload_sha256||release.records.length!==2542)throw Error('Qualified payload hash/count mismatch');
for(const key of ['canonical_place_id','selector_value'])if(new Set(release.records.map(r=>r[key])).size!==2542)throw Error('Duplicate '+key);
for(const r of release.records){
 for(const f of ['canonical_place_approved','coordinate_approved','timezone_approved','public_selection_approved','computation_approved','public_output_allowed'])if(r[f]!==true)throw Error('Missing '+f);
 if(!Number.isFinite(r.latitude)||r.latitude< -90||r.latitude>90||!Number.isFinite(r.longitude)||r.longitude< -180||r.longitude>180||r.timezone!=='Asia/Kolkata')throw Error('Invalid coordinate/timezone');
}
const quote=s=>"'"+s.replaceAll("'","''")+"'";
const sql=`BEGIN;
SET LOCAL lock_timeout='10s';
CREATE TABLE IF NOT EXISTS public.drishvara_location_activation_audit (
 batch_id text primary key, release_id text not null, payload_sha256 text not null,
 previous_manifest jsonb not null, activated_at timestamptz not null default now());
ALTER TABLE public.drishvara_location_activation_audit ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.drishvara_location_activation_audit FROM anon,authenticated;
CREATE TEMP TABLE incoming_locations(payload jsonb) ON COMMIT DROP;
INSERT INTO incoming_locations SELECT value FROM jsonb_array_elements(${quote(JSON.stringify(release.records))}::jsonb);
DO $activation$
DECLARE m public.drishvara_release_manifests%ROWTYPE; n integer;
BEGIN
 SELECT * INTO STRICT m FROM public.drishvara_release_manifests WHERE status='active' FOR UPDATE;
 IF NOT EXISTS (SELECT 1 FROM public.drishvara_panchang_runtime_releases WHERE status='active' AND release_id=m.release_id AND no_input_persistence=true) THEN RAISE EXCEPTION 'Active runtime contract unavailable'; END IF;
 IF EXISTS(SELECT 1 FROM public.drishvara_location_activation_audit WHERE batch_id='lgd_hq_20261026') THEN RAISE EXCEPTION 'Batch already activated; inspect live readback instead of replaying'; END IF;
 SELECT count(*) INTO n FROM public.drishvara_panchang_locations WHERE release_id=m.release_id;
 IF n<>5 OR (m.payload->'counts'->>'locations')::int<>5 THEN RAISE EXCEPTION 'Expected original five-location source release; reconcile concurrent changes first'; END IF;
 IF EXISTS (SELECT 1 FROM incoming_locations i JOIN public.drishvara_panchang_locations l ON l.id=i.payload->>'canonical_place_id' OR l.selector_value=i.payload->>'selector_value') THEN RAISE EXCEPTION 'Existing identity conflicts with incoming batch'; END IF;
 INSERT INTO public.drishvara_location_activation_audit(batch_id,release_id,payload_sha256,previous_manifest) VALUES('lgd_hq_20261026',m.release_id,${quote(sha)},to_jsonb(m));
 INSERT INTO public.drishvara_panchang_locations(id,release_id,selector_value,display_label,timezone,latitude,longitude,search_labels,payload,content_hash)
 SELECT payload->>'canonical_place_id',m.release_id,payload->>'selector_value',payload->>'display_label',payload->>'timezone',(payload->>'latitude')::float8,(payload->>'longitude')::float8,payload->'search_labels',payload,encode(digest(payload::text,'sha256'),'hex') FROM incoming_locations;
 m.payload:=jsonb_set(m.payload,'{counts,locations}','2547'::jsonb);
 m.payload:=m.payload||jsonb_build_object('location_extension',jsonb_build_object('batch_id','lgd_hq_20261026','payload_sha256',${quote(sha)},'source_epochs',jsonb_build_array(2017,2022),'older_official_reference_user_accepted',true));
 UPDATE public.drishvara_release_manifests SET payload=m.payload,content_hash=encode(digest(m.payload::text,'sha256'),'hex') WHERE release_id=m.release_id;
 SELECT count(*) INTO n FROM public.drishvara_panchang_locations WHERE release_id=m.release_id;
 IF n<>2547 THEN RAISE EXCEPTION 'Activation count mismatch'; END IF;
END $activation$;
COMMIT;`;
if(process.argv.includes('--write-sql')){
 const target=process.argv[process.argv.indexOf('--write-sql')+1];if(!target)throw Error('SQL output path required');fs.writeFileSync(target,sql+'\n');console.log('Wrote transactional activation SQL to '+target);process.exit(0);
}
if(!process.argv.includes('--apply')){console.log('PASS: qualified 2,542 additions; expected total 2,547. Dry run only; no database write.');process.exit(0);}
if(!process.env.SUPABASE_DB_URL)throw Error('SUPABASE_DB_URL is required; never put credentials in source files.');
const endpoint='https://pajlabwwszmhjhabxprf.supabase.co/functions/v1/calculate-panchang';
const probe=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'locations'})});
const catalog=await probe.json();if(!probe.ok||catalog.catalog_version!=='20261026'||catalog.record_count!==5)throw Error('Deploy the updated Edge Function first and verify its five-place catalog before activation.');
const run=spawnSync('psql',[process.env.SUPABASE_DB_URL,'-X','-v','ON_ERROR_STOP=1'],{input:sql,encoding:'utf8'});
// Avoid printing process arguments or server connection errors that may contain credentials.
if(run.status!==0)throw Error('Transactional activation failed; inspect database diagnostics privately. No partial transaction is committed.');
console.log('Activated qualified headquarters records. Run node scripts/readback-lgd-headquarters.mjs next.');

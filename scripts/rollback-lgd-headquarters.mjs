import fs from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {spawnSync} from 'node:child_process';
const incoming=JSON.parse(gunzipSync(fs.readFileSync('data/location-releases/lgd-hq-20261026.json.gz')).toString()).records;
const review=JSON.parse(fs.readFileSync('data/location-releases/lgd-hq-20261026-review.json'));
const q=s=>"'"+s.replaceAll("'","''")+"'";
const sql=`BEGIN;
SET LOCAL lock_timeout='10s';
CREATE TEMP TABLE expected_location_rollback(payload jsonb) ON COMMIT DROP;
INSERT INTO expected_location_rollback SELECT value FROM jsonb_array_elements(${q(JSON.stringify(incoming))}::jsonb);
DO $rollback$
DECLARE a public.drishvara_location_activation_audit%ROWTYPE; m public.drishvara_release_manifests%ROWTYPE; expected jsonb;
BEGIN
 SELECT * INTO STRICT a FROM public.drishvara_location_activation_audit WHERE batch_id='lgd_hq_20261026' FOR UPDATE;
 IF a.payload_sha256<>${q(review.payload_sha256)} THEN RAISE EXCEPTION 'Batch hash mismatch'; END IF;
 SELECT * INTO STRICT m FROM public.drishvara_release_manifests WHERE release_id=a.release_id AND status='active' FOR UPDATE;
 expected:=jsonb_set(a.previous_manifest->'payload','{counts,locations}','2547'::jsonb)||jsonb_build_object('location_extension',jsonb_build_object('batch_id','lgd_hq_20261026','payload_sha256',a.payload_sha256,'source_epochs',jsonb_build_array(2017,2022),'older_official_reference_user_accepted',true));
 IF m.payload<>expected THEN RAISE EXCEPTION 'Manifest changed after activation; reconcile instead of overwriting'; END IF;
 IF (SELECT count(*) FROM expected_location_rollback i JOIN public.drishvara_panchang_locations l ON l.id=i.payload->>'canonical_place_id' AND l.release_id=a.release_id AND l.payload=i.payload)<>2542 THEN RAISE EXCEPTION 'Batch rows changed; reconcile before rollback'; END IF;
 DELETE FROM public.drishvara_panchang_locations l USING expected_location_rollback i WHERE l.id=i.payload->>'canonical_place_id' AND l.release_id=a.release_id AND l.payload=i.payload;
 UPDATE public.drishvara_release_manifests SET payload=a.previous_manifest->'payload',content_hash=a.previous_manifest->>'content_hash' WHERE release_id=a.release_id;
 -- Keep the immutable activation audit: a replay requires explicit review.
END $rollback$;
COMMIT;`;
if(process.argv.includes('--write-sql')){const p=process.argv[process.argv.indexOf('--write-sql')+1];if(!p)throw Error('Output path required');fs.writeFileSync(p,sql+'\n');console.log('Wrote guarded rollback SQL.');process.exit(0);}
if(!process.argv.includes('--apply')){console.log('Dry run only. Rollback requires --apply and SUPABASE_DB_URL; later changes cause a guarded refusal.');process.exit(0);}
if(!process.env.SUPABASE_DB_URL)throw Error('Missing SUPABASE_DB_URL');
const result=spawnSync('psql',[process.env.SUPABASE_DB_URL,'-X','-v','ON_ERROR_STOP=1'],{input:sql,encoding:'utf8'});if(result.status!==0)throw Error('Rollback transaction refused or failed; inspect diagnostics privately.');console.log('Rolled back only this unchanged batch; original five preserved.');

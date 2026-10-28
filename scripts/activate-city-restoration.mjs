import {gunzipSync} from 'node:zlib';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
const path='data/location-releases/city-restoration-20261028.json.gz';
const raw=gunzipSync(fs.readFileSync(path)).toString('utf8'), release=JSON.parse(raw);
const review=JSON.parse(fs.readFileSync('data/location-releases/city-restoration-20261028-review.json'));
const sha=crypto.createHash('sha256').update(raw).digest('hex');
if(sha!==review.payload_sha256||release.records.length!==719)throw Error('Qualified payload hash/count mismatch');
for(const key of ['canonical_place_id','selector_value'])if(new Set(release.records.map(r=>r[key])).size!==719)throw Error('Duplicate '+key);
for(const r of release.records){
 for(const f of ['canonical_place_approved','coordinate_approved','timezone_approved','public_selection_approved','computation_approved','public_output_allowed'])if(r[f]!==true)throw Error('Missing '+f);
 if(!Number.isFinite(r.latitude)||r.latitude< -90||r.latitude>90||!Number.isFinite(r.longitude)||r.longitude< -180||r.longitude>180||!r.timezone)throw Error('Invalid coordinate/timezone');
}
const quote=s=>"'"+s.replaceAll("'","''")+"'";
const sql=`BEGIN;
SET LOCAL lock_timeout='10s';
CREATE TEMP TABLE incoming_locations(payload jsonb) ON COMMIT DROP;
INSERT INTO incoming_locations SELECT payload FROM drishvara_location_staging.cities_20261028 WHERE source_payload_hash=${quote(sha)};
DO $activation$
DECLARE m public.drishvara_release_manifests%ROWTYPE; n integer;
BEGIN
 SELECT * INTO STRICT m FROM public.drishvara_release_manifests WHERE status='active' FOR UPDATE;
 IF NOT EXISTS (SELECT 1 FROM public.drishvara_panchang_runtime_releases WHERE status='active' AND release_id=m.release_id AND no_input_persistence=true) THEN RAISE EXCEPTION 'Active runtime contract unavailable'; END IF;
 IF EXISTS(SELECT 1 FROM public.drishvara_location_activation_audit WHERE batch_id='city_restoration_20261028') THEN RAISE EXCEPTION 'Batch already activated; inspect live readback instead of replaying'; END IF;
 SELECT count(*) INTO n FROM public.drishvara_panchang_locations WHERE release_id=m.release_id;
 IF n<>2547 OR (m.payload->'counts'->>'locations')::int<>2547 THEN RAISE EXCEPTION 'Expected current 2547-location release; reconcile concurrent changes first'; END IF;
 IF (SELECT count(*) FROM incoming_locations)<>719 OR (SELECT count(distinct payload->>'selector_value') FROM incoming_locations)<>719 THEN RAISE EXCEPTION 'Staged count/identity mismatch'; END IF;
 IF EXISTS(SELECT 1 FROM incoming_locations WHERE NOT (payload @> '{"canonical_place_approved":true,"coordinate_approved":true,"timezone_approved":true,"public_selection_approved":true,"computation_approved":true,"public_output_allowed":true}'::jsonb) OR (payload->>'latitude')::float8 NOT BETWEEN -90 AND 90 OR (payload->>'longitude')::float8 NOT BETWEEN -180 AND 180 OR NOT EXISTS(SELECT 1 FROM pg_timezone_names WHERE name=payload->>'timezone')) THEN RAISE EXCEPTION 'Invalid approval/coordinate/timezone'; END IF;
 IF EXISTS (SELECT 1 FROM incoming_locations i JOIN public.drishvara_panchang_locations l ON l.id=i.payload->>'canonical_place_id' OR l.selector_value=i.payload->>'selector_value') THEN RAISE EXCEPTION 'Existing identity conflicts with incoming batch'; END IF;
 INSERT INTO public.drishvara_location_activation_audit(batch_id,release_id,payload_sha256,previous_manifest) VALUES('city_restoration_20261028',m.release_id,${quote(sha)},to_jsonb(m));
 INSERT INTO public.drishvara_panchang_locations(id,release_id,selector_value,display_label,timezone,latitude,longitude,search_labels,payload,content_hash)
 SELECT payload->>'canonical_place_id',m.release_id,payload->>'selector_value',payload->>'display_label',payload->>'timezone',(payload->>'latitude')::float8,(payload->>'longitude')::float8,payload->'search_labels',payload,encode(extensions.digest(payload::text,'sha256'),'hex') FROM incoming_locations;
 m.payload:=jsonb_set(m.payload,'{counts,locations}','3266'::jsonb);
 m.payload:=m.payload||jsonb_build_object('city_location_extension',jsonb_build_object('batch_id','city_restoration_20261028','payload_sha256',${quote(sha)},'global_cities',715,'india_references',4,'timezone_release','2026e','older_reference_user_accepted',true));
 UPDATE public.drishvara_release_manifests SET payload=m.payload,content_hash=encode(extensions.digest(m.payload::text,'sha256'),'hex') WHERE release_id=m.release_id;
 SELECT count(*) INTO n FROM public.drishvara_panchang_locations WHERE release_id=m.release_id;
 IF n<>3266 THEN RAISE EXCEPTION 'Activation count mismatch'; END IF;
END $activation$;
COMMIT;`;
if(process.argv.includes('--write-sql')){
 const target=process.argv[process.argv.indexOf('--write-sql')+1];if(!target)throw Error('SQL output path required');fs.writeFileSync(target,sql+'\n');console.log('Wrote transactional activation SQL to '+target);process.exit(0);
}
console.log('PASS: 719 additions qualified for staged activation, expected total 3266. Dry run only.');

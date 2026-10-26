import {PGlite} from '@electric-sql/pglite';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'lgd-transaction-'));
try {
 for(const [script,file] of [['activate','activation.sql'],['rollback','rollback.sql']])execFileSync(process.execPath,[`scripts/${script}-lgd-headquarters.mjs`,'--write-sql',path.join(temp,file)]);
 const db=new PGlite();
 // PostgreSQL control-flow/transaction test. Hashing is stubbed here only;
 // production uses the already-established pgcrypto digest function.
 await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated;
 CREATE FUNCTION digest(text,text) RETURNS bytea LANGUAGE SQL IMMUTABLE AS 'SELECT convert_to(md5($1),''UTF8'')';
 CREATE TABLE public.drishvara_release_manifests(release_id text primary key,status text,payload jsonb,content_hash text,created_at timestamptz default now(),activated_at timestamptz);
 CREATE TABLE public.drishvara_panchang_runtime_releases(release_id text,status text,no_input_persistence boolean);
 CREATE TABLE public.drishvara_panchang_locations(id text primary key,release_id text,selector_value text unique,display_label text,timezone text,latitude float8,longitude float8,search_labels jsonb,payload jsonb,content_hash text);
 INSERT INTO public.drishvara_release_manifests(release_id,status,payload,content_hash) VALUES('original','active','{"counts":{"locations":5,"daily":384,"festivals":114},"untouched":"yes"}','originalhash');
 INSERT INTO public.drishvara_panchang_runtime_releases VALUES('original','active',true);`);
 const original=JSON.parse(fs.readFileSync('data/knowledge-base/location-intelligence/production/ag74p-approved-location-projection.json')).records;
 for(const r of original)await db.query('INSERT INTO public.drishvara_panchang_locations(id,release_id,selector_value,payload) VALUES($1,$2,$3,$4)',[r.canonical_place_id,'original',r.selector_value,JSON.stringify(r)]);
 const count=async()=>Number((await db.query('SELECT count(*) AS n FROM public.drishvara_panchang_locations')).rows[0].n);
 const apply=fs.readFileSync(path.join(temp,'activation.sql'),'utf8'),rollback=fs.readFileSync(path.join(temp,'rollback.sql'),'utf8');
 await db.exec(apply);assert.equal(await count(),2547);
 assert.equal((await db.query('SELECT payload->>\'untouched\' AS value FROM public.drishvara_release_manifests')).rows[0].value,'yes');
 await assert.rejects(db.exec(apply),/already activated/);await db.exec('ROLLBACK');assert.equal(await count(),2547);
 await db.exec(`UPDATE public.drishvara_release_manifests SET payload=payload||'{"concurrent":"change"}'::jsonb`);
 await assert.rejects(db.exec(rollback),/Manifest changed/);await db.exec('ROLLBACK');assert.equal(await count(),2547);
 await db.exec(`UPDATE public.drishvara_release_manifests SET payload=payload-'concurrent'`);
 await db.exec(rollback);assert.equal(await count(),5);
 assert.equal((await db.query('SELECT content_hash FROM public.drishvara_release_manifests')).rows[0].content_hash,'originalhash');
 assert.equal(Number((await db.query('SELECT count(*) AS n FROM public.drishvara_location_activation_audit')).rows[0].n),1);
 await db.close();console.log('PASS: PostgreSQL transaction activates exactly 2,542 additions, preserves existing data, rejects replay/concurrent rollback and restores the original five.');
} finally { fs.rmSync(temp,{recursive:true,force:true}); }

/** Real PostgreSQL RLS in disposable PGlite; JWT helpers are simulated.
 * This is NOT hosted Supabase Auth, nor an independent security sign-off. */
import assert from "node:assert/strict";
import fs from "node:fs";
const {PGlite}=await import(process.env.WSS_PGLITE_MODULE||"@electric-sql/pglite");
const db=new PGlite();
await db.exec(`create role anon nologin; create role authenticated nologin;
 create schema auth;
 create table auth.users(id uuid primary key);
 create function auth.uid() returns uuid language sql stable as
 $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
 create function auth.jwt() returns jsonb language sql stable as
 $$select coalesce(nullif(current_setting('request.jwt.claims',true),''),'{}')::jsonb$$;
 grant usage on schema auth to anon,authenticated;
 grant execute on function auth.uid(),auth.jwt() to anon,authenticated;
 insert into auth.users values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),
 ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb');`);
await db.exec(fs.readFileSync("data/methodology/jyotisha/wss08-private-chart-vault-schema-proposal.sql.txt","utf8"));
const a="aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",b="bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const row="11111111-1111-4111-8111-111111111111";
const insert=owner=>`insert into public.wss_private_chart_vault
 (id,owner_id,cipher_version,alg,kdf,kdf_iterations,salt_b64,nonce_b64,encrypted_profile_b64)
 values ('${row}','${owner}','drishvara_wss08_chart_v1','AES-256-GCM',
 'PBKDF2-HMAC-SHA256',600000,'AAAAAAAAAAAAAAAAAAAAAA==','AAAAAAAAAAAAAAAA',repeat('A',44))`;
async function session(id,claims,role="authenticated"){
 await db.exec("reset role");
 await db.query("select set_config('request.jwt.claim.sub',$1,false),set_config('request.jwt.claims',$2,false)",
 [id,JSON.stringify(claims)]);
 await db.exec("set role "+role);
}
let checks=0;
async function denied(sql){await assert.rejects(()=>db.exec(sql));checks++;}
await session(a,{sub:a,is_anonymous:false});
await db.exec(insert(a));checks++;
assert.equal((await db.query("select id from public.wss_private_chart_vault")).rows.length,1);checks++;
await denied(`update public.wss_private_chart_vault set owner_id='${b}' where id='${row}'`);
await session(b,{sub:b,is_anonymous:false});
assert.equal((await db.query("select id from public.wss_private_chart_vault")).rows.length,0);checks++;
assert.equal((await db.query("delete from public.wss_private_chart_vault returning id")).rows.length,0);checks++;
await denied(insert(a).replace(row,"22222222-2222-4222-8222-222222222222"));
for(const claims of [{sub:a,is_anonymous:true},{sub:a}]){
 await session(a,claims);
 assert.equal((await db.query("select id from public.wss_private_chart_vault")).rows.length,0);checks++;
 assert.equal((await db.query("delete from public.wss_private_chart_vault returning id")).rows.length,0);checks++;
 await denied(insert(a).replace(row,"33333333-3333-4333-8333-333333333333"));
}
await session("",{},"anon");
await denied("select * from public.wss_private_chart_vault");
await denied("delete from public.wss_private_chart_vault");
await session(a,{sub:a,is_anonymous:false});
assert.equal((await db.query("delete from public.wss_private_chart_vault returning id")).rows.length,1);checks++;
await db.exec("reset role");
assert.equal((await db.query("select count(*)::int as n from public.wss_private_chart_vault")).rows[0].n,0);checks++;
await db.close();
fs.mkdirSync("wss08-release-qa",{recursive:true});
fs.writeFileSync("wss08-release-qa/rls-summary.json",JSON.stringify({checks,
 engine:"PGlite PostgreSQL",jwt_helpers:"simulated, not hosted Supabase Auth",
 live_database_modified:false,public_storage_approved:false},null,2)+"\n");
console.log("PASS disposable PostgreSQL owner/other-user/anon/missing-claim RLS: "+checks+" checks; no live DB writes");

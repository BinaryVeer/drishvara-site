import assert from "node:assert/strict";
import fs from "node:fs";
import {
 encryptPrivateBirthProfile,decryptPrivateBirthProfile,
 validateEncryptedBirthEnvelope,WSS_VAULT_VERSION,WSS_VAULT_KDF_ITERATIONS
} from "../scripts/lib/wss08-consented-chart-crypto.mjs";
import {
 saveEncryptedChartCandidate,listEncryptedChartsCandidate,
 deleteEncryptedChartCandidate,WSS08_CHART_VAULT_TABLE
} from "../scripts/lib/wss08-consented-vault-provider.mjs";

const source={
 name:"Synthetic User — परीक्षण",birth_date:"2000-02-29",birth_time:"13:41:23",
 approved_birth_place_selector:"ranchi-jharkhand-india",
 birth_time_precision_seconds:1,language:"hi",
 name_sign_consent:false,dasha_year_convention:"civil_365_25",
 extra_field_to_discard:"NEVER INCLUDE THIS IN AN ENCRYPTED RECORD"
};
const secret="A purely synthetic passphrase that is never sent!";
const encrypted=await encryptPrivateBirthProfile({profile:source,passphrase:secret});
assert.equal(encrypted.cipher_version,WSS_VAULT_VERSION);
assert.equal(encrypted.kdf_iterations,WSS_VAULT_KDF_ITERATIONS);
assert.equal(encrypted.alg,"AES-256-GCM");
assert.equal(Object.keys(encrypted).length,6);
const serialized=JSON.stringify(encrypted);
for(const text of ["Synthetic User","परीक्षण","2000-02-29","13:41:23",
 "ranchi-jharkhand-india","NEVER INCLUDE THIS",secret]){
 assert.equal(serialized.includes(text),false,
  "Raw private detail/passphrase leaked into stored envelope: "+text);
}
const restored=await decryptPrivateBirthProfile({envelope:encrypted,passphrase:secret});
assert.equal(restored.name,source.name);
assert.equal(restored.birth_date,source.birth_date);
assert.equal(restored.birth_time,source.birth_time);
assert.equal(restored.approved_birth_place_selector,source.approved_birth_place_selector);
assert.equal(restored.extra_field_to_discard,undefined);
assert.equal(Object.keys(restored).length,9);
assert.throws(()=>validateEncryptedBirthEnvelope({
 ...encrypted,encrypted_profile_b64:"not-base64!"
}),RangeError);
console.log("PASS WSS08 encryption roundtrip, field whitelist, no unencrypted birth information");

const second=await encryptPrivateBirthProfile({profile:source,passphrase:secret});
assert.notEqual(encrypted.salt_b64,second.salt_b64);
assert.notEqual(encrypted.nonce_b64,second.nonce_b64);
assert.notEqual(encrypted.encrypted_profile_b64,second.encrypted_profile_b64);
await assert.rejects(()=>decryptPrivateBirthProfile({envelope:encrypted,
 passphrase:"Incorrect but sufficiently long passphrase"}),/Unable to decrypt/);
const corrupted={...encrypted,encrypted_profile_b64:
 (encrypted.encrypted_profile_b64[0]==="A"?"B":"A")+
 encrypted.encrypted_profile_b64.slice(1)};
await assert.rejects(()=>decryptPrivateBirthProfile({envelope:corrupted,
 passphrase:secret}),/Unable to decrypt/);
await assert.rejects(()=>encryptPrivateBirthProfile({profile:source,
 passphrase:"short"}),RangeError);
await assert.rejects(()=>encryptPrivateBirthProfile({
 profile:{...source,birth_date:"2026-02-30"},passphrase:secret
}),RangeError);
await assert.rejects(()=>encryptPrivateBirthProfile({
 profile:{...source,language:"ne"},passphrase:secret
}),RangeError);
console.log("PASS WSS08 unique IV/salt, wrong passphrase, tamper rejection, field validation");

const owner="aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const chartId="bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
let sent=[],authCalls=0,tableCalls=0;
const db={
 auth:{getUser:async()=>{authCalls++;return {data:{user:{id:owner,is_anonymous:false}}}}},
 from(table){
  tableCalls++;assert.equal(table,WSS08_CHART_VAULT_TABLE);
  return {
   insert(row){
    sent.push(row);
    return {select(cols){
     assert.equal(cols,"id,created_at");
     return {single:async()=>({data:{id:chartId,created_at:"2026-11-05T00:00:00Z"}})};
    }};
   },
   select(fields){
    assert.ok(!fields.includes("birth_date"));
    return {eq(field,value){
     assert.equal(field,"owner_id");assert.equal(value,owner);
     return {order(){return {limit:async()=>({data:[{id:chartId,...encrypted}]})}}};
    }};
   },
   delete(){
    return {eq(field,value){
     assert.equal(field,"id");assert.equal(value,chartId);
     return {eq(field2,owner2){
      assert.equal(field2,"owner_id");assert.equal(owner2,owner);
      return {select:async()=>({data:[{id:chartId}]})};
     }};
    }};
   }
  };
 }
};
assert.deepEqual(await saveEncryptedChartCandidate({
 supabase:db,envelope:encrypted,explicitStorageConsent:false,reviewedSecurityGate:true
}),{status:"storage_consent_required",saved:false});
assert.deepEqual(await saveEncryptedChartCandidate({
 supabase:db,envelope:encrypted,explicitStorageConsent:true,reviewedSecurityGate:false
}),{status:"storage_release_not_authorized",saved:false});
assert.equal(authCalls,0);
assert.equal(tableCalls,0);
const saved=await saveEncryptedChartCandidate({
 supabase:db,envelope:encrypted,explicitStorageConsent:true,reviewedSecurityGate:true
});
assert.equal(saved.saved,true);
assert.equal(saved.id,chartId);
assert.equal(sent.length,1);
assert.equal(sent[0].owner_id,owner);
assert.deepEqual(Object.keys(sent[0]).sort(),["owner_id",...Object.keys(encrypted)].sort());
assert.equal(JSON.stringify(sent[0]).includes("Synthetic"),false);
assert.equal(JSON.stringify(sent[0]).includes("2000-02-29"),false);
const list=await listEncryptedChartsCandidate({supabase:db,reviewedSecurityGate:true});
assert.equal(list.status,"encrypted_chart_records");
assert.equal(list.charts.length,1);
assert.deepEqual(await deleteEncryptedChartCandidate({
 supabase:db,chartId,explicitDeletionConsent:false,reviewedSecurityGate:true
}),{status:"deletion_consent_required",deleted:false});
const deleted=await deleteEncryptedChartCandidate({
 supabase:db,chartId,explicitDeletionConsent:true,reviewedSecurityGate:true
});
assert.equal(deleted.deleted,true);
const anonymous={...db,auth:{getUser:async()=>({data:{user:{id:owner,is_anonymous:true}}})}};
await assert.rejects(()=>saveEncryptedChartCandidate({
 supabase:anonymous,envelope:encrypted,
 explicitStorageConsent:true,reviewedSecurityGate:true
}),/non-anonymous/);
console.log("PASS WSS08 provider consent, Auth ownership, opaque insert/list/delete, no plaintext");

const sql=fs.readFileSync("data/methodology/jyotisha/wss08-private-chart-vault-schema-proposal.sql.txt","utf8");
assert.ok(sql.includes("DO NOT APPLY TO LIVE SUPABASE YET"));
assert.ok(sql.includes("enable row level security"));
assert.ok(sql.includes("force row level security"));
assert.ok(sql.includes("grant select, insert, delete"));
assert.ok(sql.includes("to authenticated"));
assert.ok(sql.includes("(select auth.uid())=owner_id"));
assert.ok(sql.includes("'is_anonymous'"));
assert.ok(sql.includes("wss_vault_delete_own"));
assert.ok(sql.includes("on delete cascade"));
assert.equal(/^\s*(?:full_name|date_of_birth|birth_time|birth_place)\s+/mi.test(sql),false);
const moduleText=fs.readFileSync("scripts/lib/wss08-consented-chart-crypto.mjs","utf8");
assert.doesNotMatch(moduleText,/\b(?:fetch|localStorage|sessionStorage|indexedDB|sendBeacon|console\.log)\s*\(/);
console.log("PASS WSS08 staging schema RLS/delete and no plaintext birth columns; LIVE DB NOT MODIFIED");

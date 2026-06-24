import fs from "node:fs";
import crypto from "node:crypto";
import { spawnSync } from "node:child_process";

const RELEASE_ID="ag74p_final_2026_06_24";
for(const key of["SUPABASE_DB_URL","SUPABASE_URL","SUPABASE_SERVICE_ROLE_KEY"])if(!process.env[key])throw new Error(`Missing ${key}`);
const migration="supabase/migrations/20260624_ag74p_panchang_festival_star_reflection.sql";
const migrationResult=spawnSync("psql",[process.env.SUPABASE_DB_URL,"-v","ON_ERROR_STOP=1","-f",migration],{stdio:"inherit"});
if(migrationResult.status!==0)throw new Error("AG74P Supabase migration failed.");

const read=(p)=>JSON.parse(fs.readFileSync(p,"utf8"));
const locations=read("data/knowledge-base/location-intelligence/production/ag74p-approved-location-projection.json");
const daily=read("data/knowledge-base/panchang-festival/production/ag74p-approved-daily-calendar-projection.json");
const festivals=read("data/knowledge-base/panchang-festival/production/ag74p-approved-festival-observance-projection.json");
const star=read("data/methodology/star-reflection/ag74p-star-reflection-final-regression-closure.json");
const closure=read("data/content-intelligence/quality-registry/ag74p-two-asset-final-closure-record.json");
const hash=(value)=>crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex");

async function rest(table,rows){
  const list=Array.isArray(rows)?rows:[rows];
  for(let i=0;i<list.length;i+=100){
    const response=await fetch(`${process.env.SUPABASE_URL.replace(/\/$/,"")}/rest/v1/${table}`,{
      method:"POST",
      headers:{
        apikey:process.env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization:`Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        "Content-Type":"application/json",
        Prefer:"resolution=merge-duplicates,return=minimal"
      },
      body:JSON.stringify(list.slice(i,i+100))
    });
    if(!response.ok)throw new Error(`${table} write failed (${response.status}): ${await response.text()}`);
  }
}
const locationRows=locations.records.map((r)=>({id:r.canonical_place_id,release_id:RELEASE_ID,selector_value:r.selector_value,display_label:r.display_label,timezone:r.timezone,latitude:r.latitude,longitude:r.longitude,search_labels:r.search_labels,payload:r,content_hash:hash(r)}));
const dailyRows=daily.exact_records.map((r)=>({id:r.activation_record_id,release_id:RELEASE_ID,canonical_place_id:r.canonical_place_id,civil_date:r.civil_date,timezone:r.timezone,payload:r,content_hash:hash(r)}));
const festivalRows=festivals.records.map((r)=>({id:r.activation_record_id,release_id:RELEASE_ID,observance_key:r.observance_key,civil_date:r.civil_date,timezone:r.location_basis.timezone,payload:r,content_hash:hash(r)}));
const starRow={id:"ag74p_star_reflection_final",release_id:RELEASE_ID,payload:star,content_hash:hash(star)};
const manifestPayload={release_id:RELEASE_ID,status:"active",counts:{locations:locationRows.length,daily:dailyRows.length,festivals:festivalRows.length,star:1},closure,source_hashes:{locations:hash(locations),daily:hash(daily),festivals:hash(festivals),star:hash(star)}};
const manifestRow={release_id:RELEASE_ID,status:"active",payload:manifestPayload,content_hash:hash(manifestPayload),activated_at:new Date().toISOString()};

await rest("drishvara_panchang_locations",locationRows);
await rest("drishvara_panchang_daily_records",dailyRows);
await rest("drishvara_festival_observances",festivalRows);
await rest("drishvara_star_reflection_releases",starRow);
await rest("drishvara_release_manifests",manifestRow);
console.log("✅ AG74P Supabase migration and approved-record mirror write completed.");
console.log(`✅ Wrote ${locationRows.length} locations, ${dailyRows.length} daily records, ${festivalRows.length} observances and 1 Star Reflection release record.`);
console.log("✅ Service-role credential values were not printed.");

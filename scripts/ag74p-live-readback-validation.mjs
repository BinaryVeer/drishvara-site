import fs from "node:fs";
import crypto from "node:crypto";

const RELEASE_ID="ag74p_final_2026_06_24";
for(const key of["SUPABASE_URL","SUPABASE_SERVICE_ROLE_KEY"])if(!process.env[key])throw new Error(`Missing ${key}`);
const base=process.env.SUPABASE_URL.replace(/\/$/,"")+"/rest/v1";
const headers={apikey:process.env.SUPABASE_SERVICE_ROLE_KEY,Authorization:`Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`};
async function query(table,select="id"){
 const response=await fetch(`${base}/${table}?select=${encodeURIComponent(select)}&release_id=eq.${RELEASE_ID}`,{headers});
 if(!response.ok)throw new Error(`${table} readback failed (${response.status}): ${await response.text()}`);
 return response.json();
}
const results={
 locations:await query("drishvara_panchang_locations"),
 daily:await query("drishvara_panchang_daily_records"),
 festivals:await query("drishvara_festival_observances"),
 star:await query("drishvara_star_reflection_releases"),
 manifests:await query("drishvara_release_manifests","release_id,status,payload,content_hash")
};
const counts={locations:results.locations.length,daily:results.daily.length,festivals:results.festivals.length,star:results.star.length,manifests:results.manifests.length};
const expected={locations:5,daily:384,festivals:114,star:1,manifests:1};
for(const [key,value] of Object.entries(expected))if(counts[key]!==value)throw new Error(`AG74P readback count mismatch for ${key}: ${counts[key]} != ${value}`);
const manifest=results.manifests[0];
if(manifest.status!=="active"||manifest.payload?.release_id!==RELEASE_ID)throw new Error("AG74P active release manifest readback mismatch.");
const evidence={module_id:"AG74P",status:"supabase_write_readback_passed",release_id:RELEASE_ID,verified_at_utc:new Date().toISOString(),counts,manifest_content_hash:manifest.content_hash};
const output=process.env.AG74P_READBACK_OUTPUT;
if(output)fs.writeFileSync(output,JSON.stringify(evidence,null,2)+"\n");
console.log("✅ AG74P Supabase readback passed.");
console.log(`✅ Counts: ${JSON.stringify(counts)}.`);

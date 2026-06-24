const RELEASE_ID="ag74p_final_2026_06_24";
for(const key of["SUPABASE_URL","SUPABASE_SERVICE_ROLE_KEY"])if(!process.env[key])throw new Error(`Missing ${key}`);
if(process.env.AG74P_CONFIRM_ROLLBACK!=="YES")throw new Error("Set AG74P_CONFIRM_ROLLBACK=YES to execute release-data rollback.");
const base=process.env.SUPABASE_URL.replace(/\/$/,"")+"/rest/v1";
const headers={apikey:process.env.SUPABASE_SERVICE_ROLE_KEY,Authorization:`Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,Prefer:"return=minimal"};
for(const table of["drishvara_release_manifests","drishvara_star_reflection_releases","drishvara_festival_observances","drishvara_panchang_daily_records","drishvara_panchang_locations"]){
 const response=await fetch(`${base}/${table}?release_id=eq.${RELEASE_ID}`,{method:"DELETE",headers});
 if(!response.ok)throw new Error(`${table} rollback failed (${response.status}): ${await response.text()}`);
}
console.log("✅ AG74P release mirror rows were rolled back.");
console.log("ℹ️ Schema was retained; repopulation remains idempotent.");

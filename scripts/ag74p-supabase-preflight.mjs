import fs from "node:fs";
import { spawnSync } from "node:child_process";

const offline=process.argv.includes("--offline");
const requiredFiles=[
"supabase/migrations/20260624_ag74p_panchang_festival_star_reflection.sql",
"data/knowledge-base/location-intelligence/production/ag74p-approved-location-projection.json",
"data/knowledge-base/panchang-festival/production/ag74p-approved-daily-calendar-projection.json",
"data/knowledge-base/panchang-festival/production/ag74p-approved-festival-observance-projection.json",
"data/methodology/star-reflection/ag74p-star-reflection-final-regression-closure.json"
];
for(const p of requiredFiles)if(!fs.existsSync(p))throw new Error(`AG74P Supabase preflight file missing: ${p}`);
const locations=JSON.parse(fs.readFileSync(requiredFiles[1],"utf8"));
const daily=JSON.parse(fs.readFileSync(requiredFiles[2],"utf8"));
const festivals=JSON.parse(fs.readFileSync(requiredFiles[3],"utf8"));
if(locations.record_count!==5||daily.approved_daily_record_count!==384||festivals.approved_observance_count!==114)throw new Error("AG74P approved payload counts mismatch.");
if(offline){
  console.log("✅ AG74P Supabase offline preflight passed.");
  console.log("✅ Migration and approved payloads are structurally ready.");
  console.log("✅ No credential or network operation was attempted.");
  process.exit(0);
}
const requiredEnv=["SUPABASE_DB_URL","SUPABASE_URL","SUPABASE_SERVICE_ROLE_KEY"];
const missing=requiredEnv.filter((key)=>!process.env[key]);
if(missing.length)throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
if(!/^https:\/\/[^/]+\.supabase\.co\/?$/.test(process.env.SUPABASE_URL))throw new Error("SUPABASE_URL format is invalid.");
const psql=spawnSync("psql",["--version"],{encoding:"utf8"});
if(psql.status!==0)throw new Error("psql is required for the AG74P migration.");
console.log("✅ AG74P Supabase live credential preflight passed.");
console.log("✅ Required environment variables are present; values were not printed.");
console.log("✅ psql is available.");

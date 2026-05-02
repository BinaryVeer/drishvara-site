import fs from "node:fs";

const failures = [];

function check(condition, label) {
  if (condition) console.log(`✅ ${label}`);
  else {
    console.log(`❌ ${label}`);
    failures.push(label);
  }
}

console.log("Drishvara H05B language toggle click target preflight");
console.log("");

const runtime = fs.readFileSync("assets/js/drishvara-language-runtime.js", "utf8");
const shim = fs.readFileSync("assets/js/site-language.js", "utf8");

check(runtime.includes("findLanguageToggleTarget"), "Unified runtime has robust toggle finder");
check(runtime.includes("markLanguageToggleCandidates"), "Unified runtime marks toggle candidates clickable");
check(runtime.includes("language-toggle-keyboard"), "Unified runtime supports keyboard toggle");
check(runtime.includes("role\", \"button\"") || runtime.includes("role', 'button'"), "Unified runtime applies button role");
check(runtime.includes("cursor = \"pointer\"") || runtime.includes("cursor = 'pointer'"), "Unified runtime applies pointer cursor");

check(shim.includes("findLanguageToggleTarget"), "site-language shim has robust toggle finder");
check(shim.includes("markLanguageToggleCandidates"), "site-language shim marks toggle candidates clickable");
check(shim.includes("language-toggle-keyboard"), "site-language shim supports keyboard toggle");

check(!runtime.includes("createClient("), "Unified runtime does not instantiate Supabase");
check(!runtime.includes("supabase.auth"), "Unified runtime does not call Supabase auth");
check(!runtime.includes("SERVICE_ROLE"), "Unified runtime does not expose service role");

check(!shim.includes("createClient("), "Shim does not instantiate Supabase");
check(!shim.includes("supabase.auth"), "Shim does not call Supabase auth");
check(!shim.includes("SERVICE_ROLE"), "Shim does not expose service role");

console.log("");
console.log("H05B language toggle click target summary:");
console.log("- EN/हिन्दी capsule is detected even if it is not a link/button");
console.log("- Cursor/role/tabindex added at runtime");
console.log("- Keyboard Enter/Space support added");
console.log("- Supabase/Auth remains untouched");

if (failures.length) {
  console.log("");
  console.log("H05B preflight failed:");
  for (const failure of failures) console.log(`- ${failure}`);
  process.exit(1);
}

console.log("");
console.log("H05B language toggle click target preflight passed.");

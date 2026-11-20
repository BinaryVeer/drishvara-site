import assert from "node:assert/strict";
import fs from "node:fs";
import {pinnedOffsetSeconds,supportedPinnedTimezone,TIMEZONE_DATA_VERSION}
 from "../scripts/lib/wss-pinned-zone-provider.mjs";
import {resolveBirthLocalInstant} from "../scripts/lib/wss02-birth-local-instant.mjs";
const path=process.argv[2]||"wss08-release-qa/timezone-reference.json";
const reference=JSON.parse(fs.readFileSync(path,"utf8"));
assert.equal(reference.metadata.iana_version,TIMEZONE_DATA_VERSION.iana_version);
for(const [zone,sec,expected] of reference.checks)
 assert.equal(pinnedOffsetSeconds(sec*1000,zone),expected,zone+" "+sec);
assert.equal(supportedPinnedTimezone("Invalid/Zone"),null);
assert.throws(()=>pinnedOffsetSeconds(NaN,"UTC"),RangeError);
assert.throws(()=>pinnedOffsetSeconds(Date.parse("2102-01-01Z"),"UTC"),RangeError);
// Browser timezone data can be absent, obsolete or deliberately wrong.
// Birth resolution must still use exactly the frozen IANA transitions.
const original=Intl.DateTimeFormat;
try{
 Intl.DateTimeFormat=function(){throw Error("Host timezone database disabled");};
 const india=resolveBirthLocalInstant({birth_date:"1900-01-02",birth_time:"06:00:00",timezone:"Asia/Kolkata"});
 assert.equal(india.utc_offset_seconds,19270);
 assert.equal(india.timezone_data_version,"2026f");
 const fold=resolveBirthLocalInstant({birth_date:"2026-10-25",birth_time:"01:30",timezone:"Europe/London"});
 assert.equal(fold.state,"ambiguous_local_time");
 const gap=resolveBirthLocalInstant({birth_date:"2026-03-29",birth_time:"01:30",timezone:"Europe/London"});
 assert.equal(gap.state,"nonexistent_local_time");
}finally{Intl.DateTimeFormat=original;}
console.log("PASS pinned IANA "+TIMEZONE_DATA_VERSION.iana_version+": "+reference.checks.length+
 " Python ZoneInfo comparison probes across "+TIMEZONE_DATA_VERSION.zone_count+" zones; no browser tzdb dependency");

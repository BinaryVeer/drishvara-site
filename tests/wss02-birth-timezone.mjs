import assert from "node:assert/strict";
import { resolveBirthLocalInstant } from "../scripts/lib/wss02-birth-local-instant.mjs";

let cases=0;
function check(name,inputs,expectedState,validate=()=>{}) {
 const result=resolveBirthLocalInstant(inputs);
 assert.equal(result.state,expectedState,name+": "+JSON.stringify(result));
 validate(result);
 cases++;
 console.log("PASS WSS02 "+name);
}
check("Indian standard birth time with seconds",{
 birth_date:"2026-11-05",birth_time:"10:05:23",timezone:"Asia/Kolkata"
},"birth_instant_resolved",r=>{
 assert.equal(r.utc,"2026-11-05T04:35:23.000Z");
 assert.equal(r.utc_offset_seconds,19800);
 assert.equal(r.precision_seconds,1);
 assert.equal(r.chart_readiness,false);
});
check("Indian minute precision does not invent seconds",{
 birth_date:"2026-11-05",birth_time:"10:05",timezone:"Asia/Kolkata"
},"birth_instant_resolved",r=>{
 assert.equal(r.precision_seconds,60);
 assert.equal(r.interval_end_exclusive_utc,"2026-11-05T04:36:00.000Z");
});
check("London fall DST requires explicit fold",{
 birth_date:"2026-10-25",birth_time:"01:30",timezone:"Europe/London"
},"ambiguous_local_time",r=>{
 assert.equal(r.choices.length,2);
 assert.deepEqual(r.choices.map(x=>x.utc),["2026-10-25T00:30:00.000Z","2026-10-25T01:30:00.000Z"]);
 assert.deepEqual(r.choices.map(x=>x.utc_offset_seconds),[3600,0]);
});
check("London first repeated hour",{
 birth_date:"2026-10-25",birth_time:"01:30",timezone:"Europe/London",fold:"earlier"
},"birth_instant_resolved",r=>assert.equal(r.utc,"2026-10-25T00:30:00.000Z"));
check("London second repeated hour",{
 birth_date:"2026-10-25",birth_time:"01:30",timezone:"Europe/London",fold:"later"
},"birth_instant_resolved",r=>assert.equal(r.utc,"2026-10-25T01:30:00.000Z"));
check("London spring DST nonexistent time blocked",{
 birth_date:"2026-03-29",birth_time:"01:30",timezone:"Europe/London"
},"nonexistent_local_time");
check("New York autumn DST fold blocked unless selected",{
 birth_date:"2026-11-01",birth_time:"01:30",timezone:"America/New_York"
},"ambiguous_local_time",r=>{
 assert.equal(r.choices.length,2);
 assert.deepEqual(r.choices.map(x=>x.utc),["2026-11-01T05:30:00.000Z","2026-11-01T06:30:00.000Z"]);
 assert.deepEqual(r.choices.map(x=>x.utc_offset_seconds),[-14400,-18000]);
});
check("New York spring DST nonexistent blocked",{
 birth_date:"2026-03-08",birth_time:"02:30",timezone:"America/New_York"
},"nonexistent_local_time");
check("Sydney summer time +11 hours",{
 birth_date:"2026-11-05",birth_time:"05:51:26",timezone:"Australia/Sydney"
},"birth_instant_resolved",r=>{
 assert.equal(r.utc,"2026-11-04T18:51:26.000Z");
 assert.equal(r.utc_offset_seconds,39600);
});
check("Dubai static +04 hours",{
 birth_date:"2026-11-05",birth_time:"06:00",timezone:"Asia/Dubai"
},"birth_instant_resolved",r=>assert.equal(r.utc,"2026-11-05T02:00:00.000Z"));
check("Kathmandu modern fractional-hour offset",{
 birth_date:"2026-11-05",birth_time:"06:00",timezone:"Asia/Kathmandu"
},"birth_instant_resolved",r=>assert.equal(r.utc_offset_seconds,20700));
check("Kolkata historic offset preserves seconds (not minute-rounded)",{
 birth_date:"1900-01-01",birth_time:"06:00:00",timezone:"Asia/Kolkata"
},"birth_instant_resolved",r=>{
 assert.equal(r.utc_offset_seconds,19270);
 assert.equal(r.utc,"1900-01-01T00:38:50.000Z");
});
check("Kathmandu historical offset preserves non-minute seconds",{
 birth_date:"1900-01-01",birth_time:"06:00:00",timezone:"Asia/Kathmandu"
},"birth_instant_resolved",r=>assert.equal(r.utc_offset_seconds,20476));
check("unknown birth time withholds exact chart",{
 birth_date:"2000-01-01",time_precision:"unknown",timezone:"Asia/Kolkata"
},"birth_time_unknown",r=>{
 assert.equal(r.chart_readiness,false);
 assert.equal(r.utc,undefined);
});
check("invalid day never silently overflows",{
 birth_date:"2026-02-30",birth_time:"12:00",timezone:"Asia/Kolkata"
},"invalid_date");
check("impossible clock time blocked",{
 birth_date:"2026-11-05",birth_time:"25:99",timezone:"Asia/Kolkata"
},"invalid_time");
check("unapproved timezone string blocked",{
 birth_date:"2026-11-05",birth_time:"12:00",timezone:"Antarctica/NotAZone"
},"invalid_timezone");
check("approximate birth time carries uncertainty rather than precise chart claim",{
 birth_date:"2000-01-01",birth_time:"12:00",timezone:"Europe/London",
 time_precision:"approximate",uncertainty_seconds:300
},"birth_instant_resolved",r=>{
 assert.equal(r.uncertainty_seconds,300);
 assert.equal(r.precision_seconds,600);
 assert.equal(r.interval_start_utc,"2000-01-01T11:55:00.000Z");
 assert.equal(r.interval_end_exclusive_utc,"2000-01-01T12:06:00.000Z");
 assert.equal(r.chart_readiness,false);
});
check("no arbitrary timezone substitution",{
 birth_date:"2026-11-05",birth_time:"12:00",timezone:""
},"invalid_timezone");
assert.equal(cases,19);
console.log("WSS02 birth-instant resolution passed "+cases+" focused cases; no Kundali outputs activated.");

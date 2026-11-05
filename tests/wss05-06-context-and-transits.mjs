import assert from "node:assert/strict";
import {buildPersonContextCandidate,dailyTransitCandidate,periodTransitCandidate,
 natalDomainIndicatorsCandidate,DOMAIN_BASIS} from "../scripts/lib/wss05-06-context-and-transits-candidate.mjs";

const sample={
 birthDate:"1991-08-17",birthTime:"10:05:23",birthTimezone:"Asia/Kolkata",
 birthLatitude:24,birthLongitude:83,yearConvention:"civil_365_25",
 birthTimePrecisionSeconds:1
};
const person=buildPersonContextCandidate(sample);
assert.equal(person.status,"wss05_06_candidate_structured_context_not_prediction");
assert.equal(person.ready_for_public_use,false);
assert.equal(person.name_not_used_as_astronomical_variable,true);
assert.equal(person.birth_instant.utc,"1991-08-17T04:35:23.000Z");
assert.equal(person.natal.grahas.length,9);
assert.equal(person.dasha.mahadashas.length,10);
assert.equal(person.indicators.domains.length,6);
assert.equal(DOMAIN_BASIS.length,6);
for(const domain of person.indicators.domains){
 assert.equal(domain.guaranteed_future_event,false);
 assert.equal(domain.prediction_state,"unavailable_pending_validated_interpretation_rules");
 assert.ok(domain.houses.length>0);
 assert.ok(domain.requires_source_rules.length>0);
}
assert.equal(person.indicators.domains.find(x=>x.domain==="work").divisional_chart,"D10");
assert.equal(person.indicators.domains.find(x=>x.domain==="relationships").divisional_chart,"D9");
assert.equal(buildPersonContextCandidate({...sample,yearConvention:undefined}).status==="unavailable_birth_input",false);
assert.throws(()=>buildPersonContextCandidate({...sample,yearConvention:undefined}),RangeError);
console.log("PASS WSS05 candidate full context, six traditional domain evidence tables and no prediction claims");
const day=dailyTransitCandidate({referenceDate:"2026-11-05",timezone:"Europe/London",
 latitude:51.5,longitude:-0.1,natal:person.natal,dasha:person.dasha});
assert.equal(day.status,person.status);
assert.equal(day.ready_for_prediction,false);
assert.equal(day.grahas.length,9);
assert.equal(day.utc,"2026-11-05T12:00:00.000Z");
assert.ok(day.active_dasha?.major_lord);
assert.ok(day.grahas.every(g=>g.house_from_natal_moon>=1&&g.house_from_natal_moon<=12));
assert.equal(day.interpretation,"withheld_pending_source_approved_rules");
const summer=dailyTransitCandidate({referenceDate:"2026-07-05",timezone:"Europe/London",
 latitude:51.5,longitude:-0.1,natal:person.natal,dasha:person.dasha});
assert.equal(summer.utc,"2026-07-05T11:00:00.000Z");
console.log("PASS WSS06 date-specific timezone and natal Moon transit context");
const week=periodTransitCandidate({startDate:"2026-11-01",endDate:"2026-11-07",
 timezone:"America/New_York",latitude:40.7,longitude:-74,
 natal:person.natal,dasha:person.dasha});
assert.equal(week.each_local_noon_snapshot.length,7);
assert.equal(week.reference_period.dayCount,7);
assert.ok(week.each_local_noon_snapshot.every(x=>x.ready_for_prediction===false));
const annual=periodTransitCandidate({startDate:"2026-01-01",endDate:"2026-12-31",
 timezone:"Asia/Kolkata",latitude:23.4,longitude:85.3,
 natal:person.natal,dasha:person.dasha});
assert.equal(annual.each_local_noon_snapshot.length,365);
assert.equal(annual.observed_sign_changes.every(c=>c.exact_ingress_time==="not_computed_daily_sampling_only"),true);
assert.equal(annual.interpretation,"withheld_pending_source_approved_rules");
assert.throws(()=>periodTransitCandidate({startDate:"2025-01-01",endDate:"2026-12-31",
 timezone:"Asia/Kolkata",latitude:23.4,longitude:85.3,
 natal:person.natal,dasha:person.dasha}),RangeError);
console.log("PASS WSS06 seven-day DST and full 365 daily samples; no invented ingress clock");
const incomplete=buildPersonContextCandidate({...sample,birthDate:"2026-02-30"});
assert.equal(incomplete.status,"unavailable_birth_input");
assert.equal(incomplete.ready_for_public_use,undefined);
assert.equal(natalDomainIndicatorsCandidate({}).status,"unavailable_natal_lagna_or_unqualified_natal");
console.log("WSS05/06 candidate tests passed; personal forecasts remain source-gated.");

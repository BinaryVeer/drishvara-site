import assert from "node:assert/strict";
import fs from "node:fs";
import {WSS07_CATALOG_VERSION,WSS07_CATALOG_EXPECTED_COUNT,
 qualifyApprovedBirthCatalog,loadGovernedBirthCatalog,
 searchGovernedBirthCatalog,resolveSelectedApprovedBirthPlace}
 from "../scripts/lib/wss07-approved-birthplace-catalog.mjs";

const approves={
 canonical_place_approved:true,coordinate_approved:true,timezone_approved:true,
 public_selection_approved:true,computation_approved:true,public_output_allowed:true
};
const record=(id,label,latitude,longitude,timezone,aliases=[])=>({
 selectorValue:id,canonicalPlaceId:id,displayLabel:label,
 latitude,longitude,timezone,searchLabels:aliases,
 source:{...approves,search_labels:aliases}
});
const sample=[
 record("lgd-village-254106","Bedauliya — village, Aurangabad, Bihar, India",
  24.6433423812615,84.1910320664735,"Asia/Kolkata",["bedauliya","badauliya","बेदौलिया"]),
 record("bhawanathpur-township-jharkhand-india",
  "Bhawanathpur Township — Durga Mandir reference, Garhwa, Jharkhand, India",
  24.3912148,83.6053036,"Asia/Kolkata",["bhawanathpur township"]),
 record("lgd-district-525","Bengaluru / Bangalore — Bengaluru Urban headquarters, Karnataka, India",
  12.9783682911028,77.5950551098096,"Asia/Kolkata",["bengaluru","bangalore"]),
 record("qa-highlatitude","Synthetic high latitude QA locality",72.1,15.5,"Europe/Oslo")
];
const synthetic=Array.from({length:WSS07_CATALOG_EXPECTED_COUNT-sample.length},
 (_,i)=>record("qa-place-"+i,"Synthetic QA Place "+i,
  20+(i%20)*.1,70+(i%25)*.1,"Asia/Kolkata"));
const records=[...sample,...synthetic];
const catalog=qualifyApprovedBirthCatalog(records);
assert.equal(catalog.status,"approved_birth_catalog");
assert.equal(catalog.approvedCount,3266);
assert.equal(catalog.version,WSS07_CATALOG_VERSION);
assert.equal(catalog.records.length,3266);
assert.equal(catalog.automaticAliasSelection,false);
assert.equal(searchGovernedBirthCatalog(catalog,"BANGALORE")[0].selectorValue,"lgd-district-525");
assert.equal(searchGovernedBirthCatalog(catalog,"बेदौलिया")[0].selectorValue,"lgd-village-254106");
assert.equal(searchGovernedBirthCatalog(catalog,"Bhawanathpur")[0].selectorValue,
 "bhawanathpur-township-jharkhand-india");
assert.equal(searchGovernedBirthCatalog(catalog,"Synthetic QA Place",{limit:10}).length,10);
assert.equal(searchGovernedBirthCatalog(catalog,"some missing place").length,0);
const known=resolveSelectedApprovedBirthPlace(catalog,"lgd-village-254106");
assert.equal(known.status,"approved_birthplace_selected");
assert.equal(known.timezone,"Asia/Kolkata");
assert.equal(known.latitude,24.6433423812615);
assert.equal(known.preciseBirthCoordinatesNotImplied,true);
assert.equal(resolveSelectedApprovedBirthPlace(catalog,"badauliya").status,"unknown_unselected_birthplace",
 "An alias cannot bypass explicit approved place selection");
assert.equal(resolveSelectedApprovedBirthPlace(catalog,"qa-highlatitude").validForLagna,false);
assert.equal((await loadGovernedBirthCatalog({loadApprovedLocations:async()=>records})).approvedCount,3266);
console.log("PASS WSS07 governed full-size 3,266 birth catalogue, Bengaluru, Bedauliya, Bhawanathpur, explicit selection");
assert.throws(()=>qualifyApprovedBirthCatalog(records.slice(1)),RangeError);
assert.throws(()=>qualifyApprovedBirthCatalog([...records.slice(0,-1),records[0]]),RangeError);
const unapproved=record("not-approved","Not approved",12,77,"Asia/Kolkata");
unapproved.source.computation_approved=false;
assert.throws(()=>qualifyApprovedBirthCatalog([unapproved],{expectedCount:1}),RangeError);
assert.throws(()=>qualifyApprovedBirthCatalog([record("bad-tz","Bad tz",12,77,"Not/Time")],{expectedCount:1}),RangeError);
assert.throws(()=>searchGovernedBirthCatalog(catalog,"x",{limit:101}),RangeError);
assert.throws(()=>qualifyApprovedBirthCatalog(records,{catalogVersion:"20260901"}),RangeError);
assert.equal(resolveSelectedApprovedBirthPlace(null,"some").status,"catalog_unavailable");
const code=fs.readFileSync("scripts/lib/wss07-approved-birthplace-catalog.mjs","utf8");
assert.doesNotMatch(code,/\b(?:fetch|localStorage|sessionStorage|indexedDB|sendBeacon)\s*\(/);
console.log("PASS WSS07 source approval, version, duplicate, timezone and no-network/no-PII rejection");

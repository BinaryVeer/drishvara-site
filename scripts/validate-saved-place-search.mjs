import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const context={window:{},document:{readyState:'loading',addEventListener(){}}};
vm.runInNewContext(fs.readFileSync('assets/js/drishvara-v2-location.js','utf8'),context);
const api=context.window.DrishvaraV2Location;
const p=JSON.parse(fs.readFileSync('data/knowledge-base/location-intelligence/production/ag74p-approved-location-projection.json'));
const records=api.normaliseApprovedLocationPayload(p);
for(const record of records){assert(api.matchApprovedLocations(records,record.displayLabel).includes(record));for(const alias of record.searchLabels)assert(api.matchApprovedLocations(records,alias).includes(record));}
assert.equal(api.matchApprovedLocations(records,'does-not-exist-xyz').length,0);
assert.equal(api.matchApprovedLocations(records,'').length,5);
assert.equal(api.matchApprovedLocations([{displayLabel:'São Paulo',searchLabels:[]}],'sao paulo').length,1);
assert.equal(api.matchApprovedLocations([{displayLabel:'नयी दिल्ली',searchLabels:[]}],'दिल्ली').length,1);
const bad=JSON.parse(JSON.stringify(p));bad.records[0].computation_approved=false;assert.throws(()=>api.normaliseApprovedLocationPayload(bad));
console.log('PASS approved names/aliases, accents, Hindi, no matches and blocked computation records.');

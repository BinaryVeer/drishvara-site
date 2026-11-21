import assert from 'node:assert/strict';
import fs from 'node:fs';
import demo from '../data/demo/what-stars-say-report.json' with {type:'json'};
assert.equal(demo.synthetic_demo_only,true);assert.equal(demo.personal_report_enabled,false);
for(const s of Object.values(demo.scenarios))for(const v of Object.values(s.views)){
 assert.equal(v.publicOutputPermitted,false);assert.equal(v.quality.readyForPublicDisplay,false);
 assert.equal(v.planets.length,9);assert.equal(v.strength.planets.length,7);assert.equal(v.ruleBank.entries.length,38);
 assert.equal(v.dashas.every(d=>d.start===null&&d.end===null),true);
 assert.deepEqual(v.windows,{relationships:[],work:[]});
}
assert.equal(demo.scenarios.complete.views.en.charts.D9.rows.length,12);
assert.equal(demo.scenarios.boundary.views.en.charts.D9.rows.length,0);
assert.equal(fs.readFileSync('assets/js/drishvara-chart-diagram.mjs','utf8'),fs.readFileSync('scripts/lib/wss07-chart-diagram.mjs','utf8'));
const client=fs.readFileSync('assets/js/drishvara-report-workspace.mjs','utf8');
assert.doesNotMatch(client,/star-reflection-name|star-reflection-dob|localStorage|sessionStorage|calculate-panchang/);
console.log('PASS fixed synthetic scenarios, retained publication gates, boundary withholding, canonical diagram and user-input separation');

import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const sandbox={};vm.runInNewContext(fs.readFileSync('assets/js/drishvara-calendar-view.js','utf8'),sandbox);
const M=sandbox.DrishvaraCalendarView;
assert(M.civil('2024-02-29'));assert.equal(M.civil('2026-02-29'),null);assert.equal(M.civil('2026-04-31'),null);
assert.equal(M.shift('2026-12',1),'2027-01');assert.equal(M.shift('1900-01',-1),null);assert.equal(M.shift('2100-12',1),null);
for(let y=1900;y<=2100;y++)for(let m=1;m<=12;m++){
 const key=`${y}-${String(m).padStart(2,'0')}`,cells=M.monthCells(key);
 assert.equal(cells.length%7,0);assert.equal(new Date(cells[0].date+'T00:00:00Z').getUTCDay(),0);
 assert.equal(cells.filter(x=>x.inMonth).length,new Date(Date.UTC(y,m,0)).getUTCDate());
 assert.equal(new Set(cells.map(x=>x.date)).size,cells.length);
}
const p=JSON.parse(fs.readFileSync('data/knowledge-base/panchang-festival/production/ag74p-approved-festival-observance-projection.json','utf8'));
assert.equal(M.approvedRecords(p).length,p.records.length);
for(const override of [{public_output_allowed:false},{final_observance_date_approved:false},{withdrawn:true},{superseded:true},{release_id:'wrong'},{civil_date:'2026-02-30'},{location_basis:{canonical_place_id:'other',timezone:'Asia/Kolkata'}}])assert.equal(M.approvedRecords({...p,records:[{...p.records[0],...override}]}).length,0);
assert.equal(M.approvedRecords({...p,public_runtime_activation_allowed_now:false}).length,0);
assert.equal(M.approvedRecords({...p,primary_begins_ends_source:'tithi'}).length,0);
for(const f of ['panchang','what-stars-say','sports'])assert(fs.existsSync(`assets/dedicated-pages/${f==='what-stars-say'?'reflection':f}-hero.webp`));
console.log('PASS: 2,412 civil months, leap-year/boundary cases, approved-source exclusions and supplied artwork.');

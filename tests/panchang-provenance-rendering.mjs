import fs from 'node:fs';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {gunzipSync} from 'node:zlib';
const original=JSON.parse(fs.readFileSync('data/knowledge-base/location-intelligence/production/ag74p-approved-location-projection.json')).records;
const additions=JSON.parse(gunzipSync(fs.readFileSync('data/location-releases/city-restoration-20261028.json.gz'))).records;
const records=[...original,...additions];
for(const selector of ['lgd-district-525','lgd-village-254106','bhawanathpur-township-jharkhand-india','city-gn-2643743']){
 const record=records.find(r=>r.selector_value===selector);
 const dom=new JSDOM(fs.readFileSync('panchang.html','utf8'),{url:'https://www.drishvara.com/panchang.html',runScripts:'outside-only',pretendToBeVisual:true});
 const w=dom.window;w.AbortController=AbortController;w.HTMLElement.prototype.scrollIntoView=function(){};
 w.DrishvaraV2Location={loadApprovedLocationPayload:async()=>({record_count:records.length,records}),loadApprovedLocations:async()=>records};
 w.fetch=async(url)=>{
  if(String(url).includes('annual-calendar'))return Response.json(JSON.parse(fs.readFileSync('data/knowledge-base/panchang-festival/production/ag74n-varanasi-samvat-2083-annual-calendar.json')));
  return Response.json({privacy:{calculation_request_persisted:false,location_input_persisted:false,personal_data_persisted:false},public_ui_cutover_active:true,location_basis:record,panchang:{source:'approved_server_calculation',result:{available:true,sunrise:{local:'2026-10-28T06:12:11+05:30'},sunset:{local:'2026-10-28T17:54:30+05:30'},vara:{english:'Wednesday',sanskrit:'Budhavara'},paksha:'Krishna Paksha',elements:{tithi:{name:'Krishna Tritiya',index:18},nakshatra:{name:'Krittika',index:3},yoga:{name:'Vyatipata',index:17},karana:{name:'Vanija',index:35}},transitions:{}}},observances:[]});
 };
 w.eval(fs.readFileSync('assets/js/sup02-panchang-server-controller.js','utf8'));
 await new Promise(r=>setTimeout(r,150));
 assert.match(w.document.getElementById('panchang-sunrise').textContent,/06:12:11/);
 assert.match(w.document.getElementById('panchang-selection-status').textContent,/Server-governed Panchang displayed/);
 assert.ok(w.document.getElementById('panchang-coordinate-provenance').textContent.includes(record.coordinate_basis==='user_supplied_landmark_reference_point'?'user-supplied landmark':record.coordinate_basis==='city_reference_point'?'curated city':record.coordinate_basis==='official_village_reference_point'?'official village':'headquarters'));
 dom.window.close();console.log('PASS fully rendered '+selector);
}

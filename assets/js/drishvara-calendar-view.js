/* Civil-calendar presentation only: no astronomical calculation or source authorization. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.DrishvaraCalendarView=api;})(typeof globalThis==='object'?globalThis:this,function(){
 'use strict';
 function civil(value){const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value||''));if(!m)return null;const y=+m[1],mo=+m[2],d=+m[3];if(y<1900||y>2100||mo<1||mo>12||d<1||d>31)return null;const date=new Date(Date.UTC(y,mo-1,d));return date.getUTCFullYear()===y&&date.getUTCMonth()===mo-1&&date.getUTCDate()===d?{year:y,month:mo,day:d}:null;}
 function key(y,m,d){return String(y)+'-'+String(m).padStart(2,'0')+'-'+String(d).padStart(2,'0');}
 function monthCells(month){const parsed=civil(month+'-01');if(!parsed)return [];const first=new Date(Date.UTC(parsed.year,parsed.month-1,1));const days=new Date(Date.UTC(parsed.year,parsed.month,0)).getUTCDate();const count=Math.ceil((first.getUTCDay()+days)/7)*7;return Array.from({length:count},(_,i)=>{const date=new Date(Date.UTC(parsed.year,parsed.month-1,1-first.getUTCDay()+i));return {date:key(date.getUTCFullYear(),date.getUTCMonth()+1,date.getUTCDate()),day:date.getUTCDate(),inMonth:date.getUTCMonth()===parsed.month-1};});}
 function shift(month,delta){const p=civil(month+'-01');if(!p)return null;const d=new Date(Date.UTC(p.year,p.month-1+delta,1));if(d.getUTCFullYear()<1900||d.getUTCFullYear()>2100)return null;return key(d.getUTCFullYear(),d.getUTCMonth()+1,1).slice(0,7);}
 function approvedRecords(projection){
  if(!projection||projection.module_id!=='AG74P'||projection.public_runtime_activation_allowed_now!==true||projection.primary_begins_ends_source!=='primary_public_window'||typeof projection.release_id!=='string'||!Array.isArray(projection.records))return [];
  return projection.records.filter(r=>r&&r.release_id===projection.release_id&&r.final_observance_date_approved===true&&r.public_output_allowed===true&&!r.withdrawn&&!r.superseded&&civil(r.civil_date)&&r.location_basis?.canonical_place_id==='varanasi_in'&&r.location_basis?.timezone==='Asia/Kolkata'&&typeof r.display_name==='string'&&r.primary_public_window?.semantic_layer==='primary_public_window'&&typeof r.primary_public_window.start_local==='string'&&typeof r.primary_public_window.end_local==='string'&&r.primary_public_window.start_local.length>10&&r.primary_public_window.end_local.length>10).sort((a,b)=>a.civil_date.localeCompare(b.civil_date));
 }
 return Object.freeze({civil,monthCells,shift,approvedRecords});
});

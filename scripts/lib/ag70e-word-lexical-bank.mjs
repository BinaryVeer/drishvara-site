import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash, randomUUID } from "node:crypto";
import { canonicalJson, copySnapshot, snapshotHash, validApprovedRecord } from "./ag70d-word-selection-engine.mjs";
import { reviewedWordCopy } from "./ag70e-word-publication-pipeline.mjs";

export const BANK_VERSION = "ag70e.private-lexical-bank.v1";
export const PROJECT_ROOT = fileURLToPath(new URL("../../", import.meta.url));
export const DEFAULT_ROOT = path.resolve(PROJECT_ROOT, "..", "drishvara-word-bank-private");
export const digest = data => createHash("sha256").update(data).digest("hex");
const order = (a,b) => a < b ? -1 : a > b ? 1 : 0;
const fail = code => { throw Error(code); };
const json = file => JSON.parse(fs.readFileSync(file,"utf8"));
const slug = s => typeof s === "string" && /^[a-zA-Z0-9_.-]+$/.test(s) && !s.startsWith(".");

// Restricted SLP1 alphabet from Cologne's published MW input chart. No morphology.
const vowels = [..."aAiIuUfFxXeEoO"];
const independent = [..."अआइईउऊऋॠऌॡएऐओऔ"];
const signs = ["","ा","ि","ी","ु","ू","ृ","ॄ","ॢ","ॣ","े","ै","ो","ौ"];
const consonants = [..."kKgGNcCjJYwWqQRtTdDnpPbBmyrlvSzsh"];
const letters = [..."कखगघङचछजझञटठडढणतथदधनपफबभमयरलवशषसह"];
const vi = new Map(vowels.map((v,i)=>[v,i])), ci = new Map(consonants.map((v,i)=>[v,i]));
const iast = Object.fromEntries([..."aAiIuUfFxXeEoOMHkKgGNcCjJYwWqQRtTdDnpPbBmyrlvSzsh"].map((c,i)=>[c,["a","ā","i","ī","u","ū","ṛ","ṝ","ḷ","ḹ","e","ai","o","au","ṃ","ḥ","k","kh","g","gh","ṅ","c","ch","j","jh","ñ","ṭ","ṭh","ḍ","ḍh","ṇ","t","th","d","dh","n","p","ph","b","bh","m","y","r","l","v","ś","ṣ","s","h"][i]]));
export function transliterateSlp1(input) {
  if(typeof input!=="string" || !input || ![...input].every(c=>Object.hasOwn(iast,c))) fail("unsupported_slp1");
  let deva="",pending=false;
  for(const c of input){
    if(ci.has(c)){if(pending)deva+="्";deva+=letters[ci.get(c)];pending=true;}
    else if(vi.has(c)){const i=vi.get(c);deva+=pending?signs[i]:independent[i];pending=false;}
    else{if(pending)deva+="्";deva+=c==="M"?"ं":"ः";pending=false;}
  }
  if(pending)deva+="्";
  return {devanagari:deva.normalize("NFC"),iast:[...input].map(c=>iast[c]).join("").normalize("NFC")};
}
export function devanagariToSlp1(value) {
  let out="",pending=false;
  for(const c of value.normalize("NFC")){
    const consonant=letters.indexOf(c),vowel=independent.indexOf(c),sign=signs.indexOf(c);
    if(consonant>=0){if(pending)out+="a";out+=consonants[consonant];pending=true;}
    else if(c==="्"){if(!pending)fail("invalid_virama");pending=false;}
    else if(sign>0){if(!pending)fail("invalid_vowel_sign");out+=vowels[sign];pending=false;}
    else if(vowel>=0){if(pending)out+="a";out+=vowels[vowel];pending=false;}
    else if(c==="ं"||c==="ः"){if(pending)out+="a";out+=c==="ं"?"M":"H";pending=false;}
    else fail("unsupported_devanagari");
  }
  return out+(pending?"a":"");
}

export function validateCatalog(catalog,license) {
  if(catalog.version!=="ag70e.internal-source-catalog.v1" || catalog.runtime_activation!==false || catalog.public_output_allowed!==false ||
    !/^[a-f0-9]{40}$/.test(catalog.data_revision)||
    catalog.license?.id!=="CC-BY-SA-4.0" || digest(license)!==catalog.license.sha256 || !license.toString().startsWith("Attribution-ShareAlike 4.0 International") ||
    !Array.isArray(catalog.sources) || !catalog.sources.length)fail("unverified_source_license");
  const ids=new Set(),filenames=new Set(["LICENSE"]);
  for(const s of catalog.sources){
    const u=new URL(s.url),l=new URL(catalog.license.url);
    if(!slug(s.id)||ids.has(s.id)||!slug(s.filename)||filenames.has(s.filename)||!/^[a-f0-9]{64}$/.test(s.sha256)||
      u.protocol!=="https:"||u.username||u.password||u.search||u.hash||u.origin!==l.origin||
      !u.pathname.includes("/"+catalog.data_revision+"/")||!l.pathname.includes("/"+catalog.data_revision+"/")||
      s.internal_ingestion_scope!=="licensed_private_corpus"||s.public_approval!==false||!s.title||!s.provider||!s.source_reference_id)fail("invalid_source_catalog");
    ids.add(s.id);filenames.add(s.filename);
  }
  return true;
}

// Cologne's source format is a line-delimited record grammar, not well-formed XML.
export function* parseCologne(text,source) {
  let header=null,body=[],line=0,start=0;const ids=new Set();
  for(const match of text.matchAll(/[^\n]*(?:\n|$)/g)){
    if(!match[0])continue;line++;const value=match[0].replace(/\r?\n$/,"");
    if(value.startsWith("<L>")){
      if(header)fail("unterminated_source_record");
      const fields={};let consumed="";
      for(const m of value.matchAll(/<([A-Za-z0-9]+)>([^<]*)/g)){if(Object.hasOwn(fields,m[1]))fail("duplicate_header_field");fields[m[1]]=m[2];consumed+=m[0];}
      if(consumed!==value||!["L","pc","k1","k2"].every(k=>fields[k])||!/^\d+(?:\.\d+)?$/.test(fields.L)||ids.has(fields.L))fail("invalid_source_header");
      ids.add(fields.L);header=fields;start=line;body=[];
    }else if(value.startsWith("<LEND>")){
      if(!header||!body.join("").trim())fail("empty_source_record");
      yield {source_id:source.id,entry_id:header.L,page_column:header.pc,headword:header.k1.normalize("NFC"),display_key:header.k2,
        homograph_marker:header.h??null,entry_type:header.e??null,line_start:start,line_end:line,raw_markup:body.join("\n"),
        parse_errors:value==="<LEND>"?[]:["malformed_record_terminator"]};
      header=null;body=[];
    }else if(header)body.push(value);
    else if(value.trim()&&!value.startsWith(";"))fail("unexpected_source_text");
  }
  if(header)fail("unterminated_source_record");
}

export function buildCandidates(catalog,buffers,{limit=10000,priority=["manana","viveka","DErya"]}={}){
  if(!Number.isSafeInteger(limit)||limit<1)fail("invalid_import_limit");
  const grouped=new Map(),raw_counts={},quarantined=[];
  for(const source of catalog.sources){
    const bytes=buffers[source.id];if(!bytes||digest(bytes)!==source.sha256)fail("source_checksum_mismatch");
    let count=0;for(const entry of parseCologne(bytes.toString("utf8"),source)){
      count++;if(entry.parse_errors.length){quarantined.push({source_id:source.id,entry_id:entry.entry_id,errors:entry.parse_errors});continue;}
      let group=grouped.get(entry.headword);if(!group)grouped.set(entry.headword,group=[]);group.push(entry);
    }raw_counts[source.id+"@"+source.sha256]=count;
  }
  const keys=[...grouped.keys()].sort((a,b)=>order(digest(a),digest(b)));
  const chosen=[...new Set([...priority.filter(k=>grouped.has(k)),...keys])];
  const records=[],rejected=[];
  for(const headword of chosen){
    let forms;try{forms=transliterateSlp1(headword);if(devanagariToSlp1(forms.devanagari)!==headword)fail("roundtrip_mismatch");}
    catch(error){rejected.push({headword,reason:error.message});continue;}
    const entries=grouped.get(headword),id="lexical-sa-"+digest(headword).slice(0,32);
    const evidence=entries.map(e=>{
      const s=catalog.sources.find(s=>s.id===e.source_id);
      return {evidence_id:`${s.id}@${s.sha256}:${e.entry_id}`,linked_record_id:id,linked_record_type:"candidate_evidence_draft",
        source_reference_id:s.source_reference_id,source_class:"lexical_dictionary",source_access_checked:true,reuse_note_checked:true,
        word_form_found_status:"found",meaning_supported_status:"partial",transliteration_supported_status:"mechanical_roundtrip_only",
        claim_level_supported:"source_headword",internal_textual_discipline_check:"pending",public_use_permission:"not_allowed",review_status:"evidence_attached",
        source_id:s.id,source_sha256:s.sha256,license_id:catalog.license.id,entry_id:e.entry_id,page_column:e.page_column,
        homograph_marker:e.homograph_marker,display_key:e.display_key,entry_type:e.entry_type,line_start:e.line_start,line_end:e.line_end,
        raw_markup:e.raw_markup,semantic_equivalence_approved:false};
    });
    const record={record_id:id,language:"sa",lookup_form_slp1:headword,normalization:"NFC",...forms,
      identity_status:"source_headword_proposal_not_approved_equivalence",canonical_identity_approval_ref:null,
      homograph_and_sense_refs:evidence.map(e=>({source_id:e.source_id,entry_id:e.entry_id,homograph_marker:e.homograph_marker})),
      source_evidence:evidence,internal_state:"VERIFIED",verification_scope:"mechanical_source_checksum_entry_and_transliteration_only",
      verification_checks:{source_spelling_match:true,devanagari_roundtrip:true,source_provenance:true},
      production_approved:false,approved_for_daily_output:false,review_status:"pending",public_use_permission:"not_allowed",
      morphology_status:"pending",semantics_status:"pending",etymology_status:"unverified",approval_record_refs:[],
      draft:{sanskrit:forms.devanagari,iast:forms.iast,english:null,hindi:null,meaning_en:null,meaning_hi:null,reflection_en:null,reflection_hi:null,
        source_excerpt:evidence[0].raw_markup,excerpt_kind:"licensed_dictionary_markup_not_public_copy",translation_inferred:false},
      editorial_suitability_review:"pending",withdrawn:false,correction_notes:[]};
    record.version_hash=snapshotHash(record);records.push(record);if(records.length===limit)break;
  }
  return {version:BANK_VERSION,catalog:copySnapshot(catalog),raw_counts,total_raw_entries:Object.values(raw_counts).reduce((a,b)=>a+b,0),
    source_distinct_headwords:grouped.size,selected_distinct_headwords:records.length,records,rejected,quarantined,
    selection_note:"Deterministic capacity sample with the existing three pilot lookup forms first. This is not editorial ranking or daily-selection precedence.",
    runtime_activation:false,public_output_allowed:false};
}

export function approvedEngineBank(snapshot,authoritative){
  const byId=new Map(snapshot.records.map(r=>[r.record_id,r]));
  const records=(authoritative.records??[]).filter(r=>{
    const local=byId.get(r.lexical_bank_ref?.record_id);
    return local&&!local.withdrawn&&local.internal_state==="VERIFIED"&&r.lexical_bank_ref.version_hash===local.version_hash&&validApprovedRecord(r)&&
      !r.revoked&&!r.withdrawn&&!r.superseded&&reviewedWordCopy(r.reviewed_publication_copy)&&
      r.source_evidence.every(e=>local.source_evidence.some(s=>s.evidence_id===e.evidence_ref))&&
      r.reviewed_publication_copy.content.sources.every(s=>r.source_evidence.some(e=>e.evidence_ref===s.evidence_ref));
  }).map(copySnapshot);
  if(new Set(records.map(r=>r.lexical_bank_ref.record_id)).size!==records.length)fail("ambiguous_approved_bank_identity");
  return {version:"ag70e.approved-engine-bank.v1",snapshot_ref:snapshotHash(records),records,
    public_output_allowed:false,runtime_activation:false,authority:"Existing AG70E approved bank only; the hosted registry independently authorizes execution."};
}

export function inventory(snapshot,approvedBank={records:[]}){
  const approved=approvedEngineBank(snapshot,approvedBank),states={RAW:snapshot.total_raw_entries,CANDIDATE:0,VERIFIED:0,APPROVED:approved.records.length,INELIGIBLE:0};
  const approvedIds=new Set(approved.records.map(r=>r.lexical_bank_ref.record_id));let mechanical=0;
  for(const r of snapshot.records){if(r.internal_state==="VERIFIED")mechanical++;if(r.withdrawn)states.INELIGIBLE++;else if(!approvedIds.has(r.record_id))states[r.internal_state]++;}
  return {source_rows:snapshot.raw_counts,raw_entries:snapshot.total_raw_entries,source_distinct_headwords:snapshot.source_distinct_headwords,
    imported:snapshot.records.length,unique_identity_proposals:new Set(snapshot.records.map(r=>r.record_id)).size,
    unique_normalized_headwords:new Set(snapshot.records.map(r=>r.lookup_form_slp1)).size,
    mechanically_verified:mechanical,ag70e_approved_contracts:states.APPROVED,actually_publishable:states.APPROVED===0?0:null,
    withheld:snapshot.records.length-states.APPROVED,states,local_publication_enabled:false,
    quarantined_source_rows:snapshot.quarantined.length,
    verification_note:"VERIFIED is mechanical/source verification, not a qualified linguistic, rights, editorial or publisher sign-off. Positive export eligibility still requires managed registration and release checks."};
}

export function assertPrivateRoot(root){
  root=path.resolve(root);let existing=root;while(!fs.existsSync(existing))existing=path.dirname(existing);
  const real=path.join(fs.realpathSync(existing),path.relative(existing,root));
  const project=fs.realpathSync(PROJECT_ROOT);
  if(real===project||real.startsWith(project+path.sep))fail("private_bank_must_be_outside_public_project");
  return real;
}
function validateImport(state){
  if(state?.version!==BANK_VERSION||state.public_output_allowed!==false||state.runtime_activation!==false||!Array.isArray(state.records)||!state.records.length)fail("invalid_bank_snapshot");
  const ids=new Set();
  for(const r of state.records){
    const v=copySnapshot(r);delete v.version_hash;
    if(r.record_id!=="lexical-sa-"+digest(r.lookup_form_slp1).slice(0,32)||ids.has(r.record_id)||r.version_hash!==snapshotHash(v)||
      r.production_approved!==false||r.approved_for_daily_output!==false||r.review_status!=="pending"||r.public_use_permission!=="not_allowed"||
      r.internal_state!=="VERIFIED"||r.withdrawn!==false||r.canonical_identity_approval_ref!==null||r.approval_record_refs.length||
      !r.source_evidence.length||devanagariToSlp1(r.devanagari)!==r.lookup_form_slp1)fail("invalid_import_record");
    for(const e of r.source_evidence)if(e.public_use_permission!=="not_allowed"||e.review_status!=="evidence_attached"||e.semantic_equivalence_approved!==false||
      !state.catalog.sources.some(s=>s.id===e.source_id&&s.sha256===e.source_sha256))fail("untraceable_source_evidence");
    ids.add(r.record_id);
  }
}
function mergedImport(current,incoming){
  validateImport(incoming);const batch=snapshotHash(incoming);
  if(!current)return {...copySnapshot(incoming),batch_ids:[batch],catalogs:[incoming.catalog]};
  if(current.batch_ids.includes(batch))return current;
  const byId=new Map(current.records.map(r=>[r.record_id,r]));
  for(const row of incoming.records){const old=byId.get(row.record_id);if(!old){current.records.push(copySnapshot(row));continue;}
    const refs=new Set(old.source_evidence.map(e=>e.evidence_id));
    const added=row.source_evidence.filter(e=>!refs.has(e.evidence_id));
    if(added.length){old.source_evidence.push(...copySnapshot(added));old.homograph_and_sense_refs.push(...added.map(e=>({source_id:e.source_id,entry_id:e.entry_id,homograph_marker:e.homograph_marker})));
      const v=copySnapshot(old);delete v.version_hash;old.version_hash=snapshotHash(v);}
  }
  for(const [key,n]of Object.entries(incoming.raw_counts)){if(current.raw_counts[key]!==undefined&&current.raw_counts[key]!==n)fail("source_count_conflict");current.raw_counts[key]=n;}
  current.total_raw_entries=Object.values(current.raw_counts).reduce((a,b)=>a+b,0);current.source_distinct_headwords=null;
  current.selected_distinct_headwords=current.records.length;current.catalogs.push(incoming.catalog);current.batch_ids.push(batch);
  current.quarantined=[...new Map([...current.quarantined,...incoming.quarantined].map(q=>[canonicalJson(q),q])).values()];
  return current;
}
function applyChange(state,operation,payload){
  if(!state||!payload||Object.keys(payload).some(k=>!["record_id","expected_version","reason"].includes(k))||typeof payload.reason!=="string"||!payload.reason.trim())fail("invalid_bank_event");
  const r=state.records.find(r=>r.record_id===payload.record_id);if(!r||r.version_hash!==payload.expected_version)fail("stale_bank_correction");
  r.correction_notes.push(payload.reason);r.withdrawn=operation==="withdraw"||r.withdrawn;r.internal_state=r.withdrawn?"INELIGIBLE":"CANDIDATE";
  const v=copySnapshot(r);delete v.version_hash;r.version_hash=snapshotHash(v);
}
function atomic(file,data){
  const tmp=file+"."+randomUUID()+".tmp";let fd;
  try{fd=fs.openSync(tmp,"wx",0o600);fs.writeFileSync(fd,data);fs.fsyncSync(fd);fs.closeSync(fd);fd=undefined;fs.renameSync(tmp,file);}
  finally{if(fd!==undefined)fs.closeSync(fd);if(fs.existsSync(tmp))fs.unlinkSync(tmp);}
}
function noSymlink(file){if(fs.existsSync(file)&&fs.lstatSync(file).isSymbolicLink())fail("bank_symlink_not_allowed");}
export class PrivateLexicalStore {
  constructor(root=DEFAULT_ROOT){this.root=assertPrivateRoot(root);fs.mkdirSync(this.root,{recursive:true,mode:0o700});fs.chmodSync(this.root,0o700);}
  locked(run){const file=path.join(this.root,"LOCK");let fd;try{fd=fs.openSync(file,"wx",0o600);fs.writeFileSync(fd,String(process.pid));return run();}finally{if(fd!==undefined){fs.closeSync(fd);fs.unlinkSync(file);}}}
  append(operation,payload){return this.locked(()=>{
    noSymlink(path.join(this.root,"CURRENT"));noSymlink(path.join(this.root,"commits"));
    let parent=null,state;if(fs.existsSync(path.join(this.root,"CURRENT"))){const loaded=this.load();state=loaded.snapshot;parent=loaded.current;}
    else if(operation!=="import")fail("bank_not_initialized");
    if(operation==="import"){validateImport(payload);if(state?.batch_ids.includes(snapshotHash(payload)))return parent;mergedImport(state,payload);}
    else if(["withdraw","correct"].includes(operation))applyChange(state,operation,payload);
    else fail("unsupported_bank_event");
    const event={version:BANK_VERSION,parent,operation,payload};const hash=digest(canonicalJson(event));
    const dir=path.join(this.root,"commits");fs.mkdirSync(dir,{recursive:true,mode:0o700});const file=path.join(dir,hash+".json");
    noSymlink(file);
    if(!fs.existsSync(file)){const fd=fs.openSync(file,"wx",0o600);try{fs.writeFileSync(fd,canonicalJson(event));fs.fsyncSync(fd);}finally{fs.closeSync(fd);}}
    atomic(path.join(this.root,"CURRENT"),hash+"\n");return hash;
  });}
  load(){
    noSymlink(path.join(this.root,"CURRENT"));noSymlink(path.join(this.root,"commits"));
    const current=fs.readFileSync(path.join(this.root,"CURRENT"),"utf8").trim(),chain=[],seen=new Set();let hash=current;
    while(hash){if(!/^[a-f0-9]{64}$/.test(hash)||seen.has(hash))fail("invalid_bank_history");seen.add(hash);
      const file=path.join(this.root,"commits",hash+".json");noSymlink(file);
      const e=json(file);if(e.version!==BANK_VERSION||digest(canonicalJson(e))!==hash)fail("bank_history_hash_mismatch");chain.push(e);hash=e.parent;
    }
    chain.reverse();let state;
    for(const e of chain){
      if(e.operation==="import")state=mergedImport(state,e.payload);
      else if(["withdraw","correct"].includes(e.operation))applyChange(state,e.operation,e.payload);
      else fail("unsupported_bank_event");
    }
    if(!state||state.version!==BANK_VERSION||state.public_output_allowed!==false||new Set(state.records.map(r=>r.record_id)).size!==state.records.length)fail("invalid_bank_snapshot");
    return {snapshot:state,chain,current};
  }
  change(operation,id,reason,expectedVersion){
    if(!["withdraw","correct"].includes(operation)||typeof reason!=="string"||!reason.trim())fail("invalid_bank_change");
    const r=this.load().snapshot.records.find(r=>r.record_id===id);if(!r)fail("unknown_lexical_identity");
    if(expectedVersion&&expectedVersion!==r.version_hash)fail("stale_bank_correction");
    return this.append(operation,{record_id:id,expected_version:r.version_hash,reason});
  }
}

export function pilotReviewPackage(snapshot,dossier){
  const lookup={reflection:"manana",discernment:"viveka",patience:"DErya"};
  const proposals=dossier.consolidated_production_preparation.final_release_review.publication_copy_proposals;
  const records=Object.entries(lookup).map(([word_id,form])=>{
    const historical=dossier.words.find(w=>w.word_id===word_id),proposal=proposals.find(w=>w.word_id===word_id);
    const local=snapshot.records.find(r=>r.lookup_form_slp1===form);if(!historical||!proposal||!local)fail("pilot_evidence_missing");
    const content=Object.fromEntries(["english","hindi","sanskrit","iast","meaning_en","meaning_hi"].map(k=>[k,proposal[k]]));
    Object.assign(content,{reflection_en:historical.original_copy.meaning_en,reflection_hi:historical.original_copy.meaning_hi,
      sources:local.source_evidence.map(e=>{
        const s=snapshot.catalogs.flatMap(c=>c.sources).find(s=>s.id===e.source_id&&s.sha256===e.source_sha256);
        return {evidence_ref:e.evidence_id,title:s.title,publisher:s.provider,url:s.edition_url,
          attribution:`${s.author}, ${s.year}; ${s.provider}; ${e.entry_id}, ${e.page_column}; CC BY-SA 4.0. Normalized/transliterated draft.`,
          reuse_approval_ref:null,review_status:"pending"};
      })});
    const content_hash=snapshotHash(content);
    return {word_id,historical_draft_id:historical.draft_id,lexical_bank_ref:{record_id:local.record_id,version_hash:local.version_hash},
      source_entry_refs:local.source_evidence.map(e=>e.evidence_id),sense_selection_status:"pending_homograph_and_context_review",
      copy_origin:"Existing dossier proposals and historical editorial reflections; not new dictionary quotations or authenticated translations.",
      reviewed_publication_copy:{contract_version:"ag70e.word-copy.v1",version:proposal.version,content,
        iast_review_status:"omitted_pending",iast_approval_ref:null,
        reviews:["linguistic","editorial","rights","context","safety"].map(kind=>({kind,content_hash,review_status:"pending",approval_ref:null}))},
      production_approved:false,public_use_permission:"not_allowed",eligible_for_daily_selection:false};
  });
  return {version:"ag70e.private-pilot-review.v1",bank_snapshot_ref:snapshotHash(snapshot.records),records,
    runtime_activation:false,public_output_allowed:false};
}

// Portable, licensed private backup. Restore re-derives each imported record from its pinned raw source.
export function exportPrivateBank(store,out){
  out=assertPrivateRoot(out);noSymlink(out);if(fs.existsSync(out))fail("backup_already_exists");
  const loaded=store.load(),catalogs=loaded.snapshot.catalogs;
  const raw=[...new Map(catalogs.map(c=>[snapshotHash(c),c])).values()].map(c=>{
    noSymlink(path.join(store.root,"raw"));const dir=path.join(store.root,"raw",c.data_revision);noSymlink(dir);
    const bytes=Object.fromEntries(["LICENSE",...c.sources.map(s=>s.filename)].map(name=>{
      const file=path.join(dir,name);noSymlink(file);return [name,fs.readFileSync(file)];
    }));validateCatalog(c,bytes.LICENSE);
    for(const source of c.sources)if(digest(bytes[source.filename])!==source.sha256)fail("source_checksum_mismatch");
    const files=Object.fromEntries(Object.entries(bytes).map(([name,data])=>[name,data.toString("base64")]));return {catalog_ref:snapshotHash(c),files};
  });
  const backup={version:"ag70e.private-bank-backup.v1",current:loaded.current,chain:loaded.chain,raw,
    license_notice:"Cologne Digital Sanskrit Dictionaries; CC BY-SA 4.0. Source, edition and change attribution retained in each import catalog. Private draft, not publication approval."};
  fs.mkdirSync(path.dirname(out),{recursive:true,mode:0o700});atomic(out,canonicalJson(backup));return {current:loaded.current,sha256:digest(fs.readFileSync(out)),bytes:fs.statSync(out).size};
}
export function restorePrivateBank(file,root){
  root=assertPrivateRoot(root);if(fs.existsSync(root))fail("restore_requires_new_directory");
  const backup=json(file);if(backup.version!=="ag70e.private-bank-backup.v1"||!Array.isArray(backup.chain)||!backup.chain.length)fail("invalid_backup");
  let parent=null;const raws=[];
  for(const event of backup.chain){
    if(event.version!==BANK_VERSION||event.parent!==parent)fail("backup_chain_mismatch");
    parent=digest(canonicalJson(event));
    if(event.operation!=="import")continue;
    const p=event.payload,c=p.catalog,raw=backup.raw.find(r=>r.catalog_ref===snapshotHash(c));if(!raw)fail("backup_source_missing");
    const files=Object.fromEntries(Object.entries(raw.files).map(([name,value])=>{if(!slug(name))fail("unsafe_backup_path");return [name,Buffer.from(value,"base64")];}));
    validateCatalog(c,files.LICENSE);
    const buffers=Object.fromEntries(c.sources.map(s=>[s.id,files[s.filename]]));
    const rebuilt=buildCandidates(c,buffers,{limit:p.records.length,priority:p.records.map(r=>r.lookup_form_slp1)});
    if(canonicalJson(rebuilt.records)!==canonicalJson(p.records)||canonicalJson(rebuilt.raw_counts)!==canonicalJson(p.raw_counts)||
      canonicalJson(rebuilt.quarantined)!==canonicalJson(p.quarantined))fail("backup_evidence_mismatch");
    raws.push({catalog:c,files});
  }
  if(parent!==backup.current)fail("backup_current_mismatch");
  fs.mkdirSync(path.dirname(root),{recursive:true,mode:0o700});const staging=fs.mkdtempSync(root+".restore-");
  try{
    const store=new PrivateLexicalStore(staging);
    for(const e of backup.chain)store.append(e.operation,e.payload);
    if(store.load().current!==backup.current)fail("backup_replay_mismatch");
    for(const {catalog:c,files}of raws){const dir=path.join(staging,"raw",c.data_revision);fs.mkdirSync(dir,{recursive:true,mode:0o700});
      for(const [name,data]of Object.entries(files))atomic(path.join(dir,name),data);}
    const count=store.load().snapshot.records.length;fs.renameSync(staging,root);return {current:backup.current,records:count};
  }finally{if(fs.existsSync(staging))fs.rmSync(staging,{recursive:true});}
}

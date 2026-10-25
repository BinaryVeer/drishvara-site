import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { performance } from "node:perf_hooks";
import { spawn, spawnSync } from "node:child_process";
import { digest, transliterateSlp1, devanagariToSlp1, validateCatalog, parseCologne, buildCandidates,
  PrivateLexicalStore, inventory, approvedEngineBank, pilotReviewPackage, exportPrivateBank, restorePrivateBank, assertPrivateRoot } from "./lib/ag70e-word-lexical-bank.mjs";
import { snapshotHash, copySnapshot, selectDailyWord } from "./lib/ag70d-word-selection-engine.mjs";
import { reviewedWordCopy } from "./lib/ag70e-word-publication-pipeline.mjs";
import { syntheticWord, syntheticSelection, syntheticPublication } from "./lib/ag70e-word-test-fixtures.mjs";
import { runLexicalCommand } from "./word-lexical-bank.mjs";

// Every generated lexical row and approval below is synthetic, never production evidence.
let checks=0;const check=(name,run)=>{run();checks++;console.log("PASS "+name);};
const eq=(a,b)=>assert.deepEqual(a,b),throws=(fn,code)=>assert.throws(fn,new RegExp(code));
const dir=fs.mkdtempSync(path.join(os.tmpdir(),"word-lexical-test-"));
const license=Buffer.from("Attribution-ShareAlike 4.0 International\nSynthetic validator fixture, not a source-use permission.");
function fixture(words=["manana","viveka","DErya","manana"]){
  const raw=Buffer.from(words.map((w,i)=>`<L>${i+1}<pc>1,1<k1>${w}<k2>${w}<h>${i}\nSynthetic bounded source content.\n<LEND>\n`).join(""));
  const source={id:"synthetic-source",filename:"synthetic.txt",source_reference_id:"synthetic-only",title:"Synthetic dictionary",author:"Test",year:1,
    provider:"Synthetic test provider",edition_url:"https://example.invalid/fixture",url:"https://example.invalid/"+"a".repeat(40)+"/synthetic.txt",
    sha256:digest(raw),internal_ingestion_scope:"licensed_private_corpus",public_approval:false};
  const catalog={version:"ag70e.internal-source-catalog.v1",data_revision:"a".repeat(40),sources:[source],
    license:{id:"CC-BY-SA-4.0",sha256:digest(license),url:"https://example.invalid/"+"a".repeat(40)+"/LICENSE"},runtime_activation:false,public_output_allowed:false};
  return {raw,catalog,buffers:{[source.id]:raw},source};
}
function rawFiles(root,f){const d=path.join(root,"raw",f.catalog.data_revision);fs.mkdirSync(d,{recursive:true});fs.writeFileSync(path.join(d,"LICENSE"),license);fs.writeFileSync(path.join(d,f.source.filename),f.raw);}
try{
  const forms={manana:["मनन","manana"],viveka:["विवेक","viveka"],DErya:["धैर्य","dhairya"],karman:["कर्मन्","karman"],saMskfta:["संस्कृत","saṃskṛta"],prajYA:["प्रज्ञा","prajñā"],f:["ऋ","ṛ"],X:["ॡ","ḹ"]};
  for(const [slp,[deva,iast]]of Object.entries(forms))check("SLP1 roundtrip "+slp,()=>{eq(transliterateSlp1(slp),{devanagari:deva,iast});eq(devanagariToSlp1(deva),slp);});
  check("NFC IAST",()=>eq(transliterateSlp1("saMskfta").iast.normalize("NFD").normalize("NFC"),"saṃskṛta"));
  for(const value of ["","a-b","a1","é","a/b"])check("unsupported SLP1 "+JSON.stringify(value),()=>throws(()=>transliterateSlp1(value),"unsupported_slp1"));
  check("invalid vowel sign",()=>throws(()=>devanagariToSlp1("ा"),"invalid_vowel_sign"));
  check("invalid virama",()=>throws(()=>devanagariToSlp1("्"),"invalid_virama"));
  const f=fixture();let bank=buildCandidates(f.catalog,f.buffers);
  check("licence and pin verified",()=>eq(validateCatalog(f.catalog,license),true));
  check("wrong licence bytes",()=>throws(()=>validateCatalog(f.catalog,Buffer.from("wrong")),"unverified_source_license"));
  check("unknown licence rejected",()=>{const c=copySnapshot(f.catalog);c.license.id="unrestricted";throws(()=>validateCatalog(c,license),"unverified_source_license");});
  check("source origin mismatch",()=>{const c=copySnapshot(f.catalog);c.sources[0].url=c.sources[0].url.replace("example.invalid","other.invalid");throws(()=>validateCatalog(c,license),"invalid_source_catalog");});
  check("path traversal rejected",()=>{const c=copySnapshot(f.catalog);c.sources[0].filename="../bad";throws(()=>validateCatalog(c,license),"invalid_source_catalog");});
  check("source approval cannot be inferred",()=>{const c=copySnapshot(f.catalog);c.sources[0].public_approval=true;throws(()=>validateCatalog(c,license),"invalid_source_catalog");});
  check("source checksum mismatch",()=>throws(()=>buildCandidates(f.catalog,{[f.source.id]:Buffer.from("wrong")}),"source_checksum_mismatch"));
  check("source parsing, identity dedup and separate homographs",()=>{eq(bank.total_raw_entries,4);eq(bank.records.length,3);eq(bank.records[0].source_evidence.length,2);eq(bank.records[0].homograph_and_sense_refs.map(r=>r.homograph_marker),["0","3"]);});
  check("no inferred translations or approvals",()=>assert(bank.records.every(r=>r.draft.hindi===null&&r.draft.english===null&&r.draft.translation_inferred===false&&r.production_approved===false)));
  check("unsupported orthography withheld from bank",()=>{const s=fixture(["a-b","manana"]);eq(buildCandidates(s.catalog,s.buffers).records.length,1);});
  check("missing header field",()=>throws(()=>[...parseCologne("<L>1<k1>a<k2>a\ntext\n<LEND>",f.source)],"invalid_source_header"));
  check("duplicate source entry ID",()=>throws(()=>[...parseCologne(f.raw.toString()+f.raw.toString(),f.source)],"invalid_source_header"));
  check("unterminated source",()=>throws(()=>[...parseCologne("<L>1<pc>1<k1>a<k2>a\ntext",f.source)],"unterminated_source_record"));
  check("malformed terminator quarantined",()=>{const bytes=Buffer.from(f.raw.toString().replace("<LEND>","<LEND><")),c=copySnapshot(f.catalog);c.sources[0].sha256=digest(bytes);const b=buildCandidates(c,{[f.source.id]:bytes});eq(b.quarantined.length,1);eq(b.total_raw_entries,4);assert(b.records.every(r=>r.source_evidence.every(e=>e.entry_id!=="1")));});
  check("deterministic repeated import",()=>eq(snapshotHash(bank),snapshotHash(buildCandidates(f.catalog,f.buffers))));
  check("invalid import limit",()=>throws(()=>buildCandidates(f.catalog,f.buffers,{limit:0}),"invalid_import_limit"));
  check("public webroot rejected",()=>throws(()=>assertPrivateRoot(process.cwd()+"/private-bank"),"outside_public_project"));
  const root=path.join(dir,"bank"),store=new PrivateLexicalStore(root);rawFiles(root,f);
  const first=store.append("import",bank);
  check("bank persisted with private permissions",()=>{eq(store.load().snapshot.records.length,3);eq(fs.statSync(root).mode&0o777,0o700);});
  check("identical import idempotent",()=>{eq(store.append("import",bank),first);eq(store.load().chain.length,1);});
  const id=bank.records[0].record_id,version=bank.records[0].version_hash;
  check("exclusive writer lock",()=>{fs.writeFileSync(path.join(root,"LOCK"),"synthetic");try{throws(()=>store.append("import",bank),"EEXIST");assert(fs.existsSync(path.join(root,"LOCK")));}finally{fs.unlinkSync(path.join(root,"LOCK"));}});
  check("unknown operation rejected without append",()=>{throws(()=>store.append("approve",{}),"unsupported_bank_event");eq(store.load().current,first);});
  check("approval injected into import rejected",()=>{const bad=copySnapshot(bank);bad.records[0].production_approved=true;throws(()=>store.append("import",bad),"invalid_import_record");});
  check("correction is append-only and resets qualification",()=>{store.change("correct",id,"Synthetic correction review",version);eq(store.load().chain.length,2);eq(store.load().snapshot.records[0].internal_state,"CANDIDATE");assert(fs.existsSync(path.join(root,"commits",first+".json")));});
  check("stale version correction rejected",()=>throws(()=>store.change("correct",id,"Stale",version),"stale_bank_correction"));
  check("withdrawal persists through repeat import",()=>{store.change("withdraw",id,"Synthetic withdrawal");store.append("import",bank);eq(store.load().snapshot.records[0].withdrawn,true);eq(inventory(store.load().snapshot).states.INELIGIBLE,1);});
  check("correct cannot undo withdrawal",()=>{store.change("correct",id,"Re-review requested");eq(store.load().snapshot.records[0].internal_state,"INELIGIBLE");});
  check("additive import preserves existing records",()=>{const f2=fixture(["agni","viveka"]),b2=buildCandidates(f2.catalog,f2.buffers);store.append("import",b2);eq(store.load().snapshot.records.length,4);eq(store.load().snapshot.records[0].withdrawn,true);});
  // Use a clean, source-complete bank for licensed backup and restore verification.
  const portable=new PrivateLexicalStore(path.join(dir,"portable"));rawFiles(portable.root,f);portable.append("import",bank);portable.change("correct",id,"Synthetic historical note");
  const backup=path.join(dir,"backup.json"),restored=path.join(dir,"restored");
  check("licensed export contains raw source and history",()=>{const receipt=exportPrivateBank(portable,backup);eq(receipt.current,portable.load().current);const b=JSON.parse(fs.readFileSync(backup));assert(b.license_notice.includes("CC BY-SA"));eq(b.raw.length,1);});
  check("export rejects altered source bytes",()=>{const file=path.join(portable.root,"raw",f.catalog.data_revision,f.source.filename);fs.writeFileSync(file,"altered");try{throws(()=>exportPrivateBank(portable,path.join(dir,"bad-export.json")),"checksum");}finally{fs.writeFileSync(file,f.raw);}});
  check("restore rederives source evidence and preserves history",()=>{restorePrivateBank(backup,restored);eq(new PrivateLexicalStore(restored).load(),portable.load());});
  check("restore refuses overwrite",()=>throws(()=>restorePrivateBank(backup,restored),"new_directory"));
  check("tampered backup rejected",()=>{const b=JSON.parse(fs.readFileSync(backup));b.raw[0].files[f.source.filename]=Buffer.from("wrong").toString("base64");const file=path.join(dir,"tampered.json");fs.writeFileSync(file,JSON.stringify(b));throws(()=>restorePrivateBank(file,path.join(dir,"bad-restore")),"checksum");assert(!fs.existsSync(path.join(dir,"bad-restore")));});
  check("history tampering detected",()=>{const file=path.join(restored,"commits",new PrivateLexicalStore(restored).load().current+".json");const before=fs.readFileSync(file);fs.writeFileSync(file,before.toString().replace("Synthetic historical note","tampered"));throws(()=>new PrivateLexicalStore(restored).load(),"hash_mismatch");fs.writeFileSync(file,before);});
  check("unreferenced crash-orphan ignored",()=>{fs.writeFileSync(path.join(root,"commits","orphan.json"),"{}");eq(store.load().snapshot.records.length,4);});
  check("CURRENT symlink rejected",()=>{const r=path.join(dir,"symlink");fs.mkdirSync(r);fs.symlinkSync(path.join(root,"CURRENT"),path.join(r,"CURRENT"));throws(()=>new PrivateLexicalStore(r).load(),"symlink");});
  check("raw unapproved records never export as approved",()=>eq(approvedEngineBank(bank,{records:bank.records}).records.length,0));
  const reviewed=syntheticWord(1);reviewed.lexical_bank_ref={record_id:bank.records[0].record_id,version_hash:bank.records[0].version_hash};
  reviewed.source_evidence=[{evidence_ref:bank.records[0].source_evidence[0].evidence_id,review_status:"approved"}];
  reviewed.reviewed_publication_copy.content.sources[0].evidence_ref=reviewed.source_evidence[0].evidence_ref;
  for(const r of reviewed.reviewed_publication_copy.reviews)r.content_hash=snapshotHash(reviewed.reviewed_publication_copy.content);
  check("existing approved contract accepted only with matching bank version",()=>eq(approvedEngineBank(bank,{records:[reviewed]}).records.length,1));
  check("synthetic qualified export plugs into unchanged unused-first selector",()=>{const input=syntheticSelection(1);input.bank=approvedEngineBank(bank,{records:[reviewed]});const result=selectDailyWord(input);eq(result.status,"proposal");eq(result.public_output_allowed,false);eq(result.runtime_activation,false);});
  check("wrong bank version withheld",()=>{const r=copySnapshot(reviewed);r.lexical_bank_ref.version_hash="wrong";eq(approvedEngineBank(bank,{records:[r]}).records.length,0);});
  check("missing word review withheld",()=>{const r=copySnapshot(reviewed);r.reviewed_publication_copy.reviews.pop();eq(approvedEngineBank(bank,{records:[r]}).records.length,0);});
  check("wrong source evidence withheld",()=>{const r=copySnapshot(reviewed);r.source_evidence[0].evidence_ref="unrelated";eq(approvedEngineBank(bank,{records:[r]}).records.length,0);});
  check("revoked approved record withheld",()=>{const r=copySnapshot(reviewed);r.revoked=true;eq(approvedEngineBank(bank,{records:[r]}).records.length,0);});
  check("corrected or withdrawn private source withheld",()=>{eq(approvedEngineBank(portable.load().snapshot,{records:[reviewed]}).records.length,0);eq(approvedEngineBank(store.load().snapshot,{records:[reviewed]}).records.length,0);});
  check("ambiguous active versions rejected",()=>throws(()=>approvedEngineBank(bank,{records:[reviewed,reviewed]}),"ambiguous_approved_bank_identity"));
  const input=syntheticSelection();input.bank=approvedEngineBank(bank,{records:[]});
  check("empty real approval inventory causes withholding",()=>{const r=selectDailyWord(input);eq(r.status,"withheld");eq(r.public_output_allowed,false);});
  const lifecycle=await syntheticPublication();
  check("existing synthetic reserve-authorize-publish projection still works",()=>{eq(lifecycle.output.status,"published");eq(lifecycle.history.events.length,4);});
  const cli=await runLexicalCommand("search",["--root",root,"--query","viveka","--limit","2"]);
  check("private search and filtering",()=>eq(cli.matched,1));
  check("CLI stale correction rejects",()=>{const r=spawnSync(process.execPath,["scripts/word-lexical-bank.mjs","correct","--root",root,"--id",id,"--reason","test","--expected-version",version],{encoding:"utf8"});eq(r.status,1);assert(r.stderr.includes("stale_bank_correction"));});
  const concurrent=new PrivateLexicalStore(path.join(dir,"concurrent"));concurrent.append("import",bank);
  const attempts=[1,2].map(n=>new Promise((resolve,reject)=>{
    const child=spawn(process.execPath,["scripts/word-lexical-bank.mjs","correct","--root",concurrent.root,"--id",id,"--reason","Synthetic concurrent "+n,"--expected-version",version],{stdio:"ignore"});child.once("error",reject);child.once("exit",resolve);
  }));
  const statuses=[];for(const attempt of attempts)statuses.push(await attempt);
  check("two real local processes: one correction wins, one rejected",()=>{eq(statuses.sort(),[0,1]);eq(concurrent.load().chain.length,2);});
  const words=Array.from({length:10000},(_,i)=>"a"+i.toString(10).split("").map(n=>"kgcjtdpbmn"[Number(n)]).join("")+"a");
  const big=fixture(words),started=performance.now(),large=buildCandidates(big.catalog,big.buffers,{priority:[]});
  const buildMs=performance.now()-started;
  check("10,000 synthetic identities, unique and bounded performance",()=>{eq(large.records.length,10000);eq(new Set(large.records.map(r=>r.record_id)).size,10000);assert(buildMs<30000);});
  check("10,000 synthetic records deterministic and unapproved",()=>{eq(snapshotHash(large),snapshotHash(buildCandidates(big.catalog,big.buffers,{priority:[]})));eq(inventory(large).ag70e_approved_contracts,0);eq(inventory(large).actually_publishable,0);});
  const real=process.argv[process.argv.indexOf("--real-root")+1];
  if(process.argv.includes("--real-root")){
    const actual=new PrivateLexicalStore(real).load().snapshot,approved=JSON.parse(fs.readFileSync("data/knowledge-base/word-of-day/production/knowledge-bank/approved-output-candidate-bank.json"));
    check("REAL corpus count: 321,407 rows; 10,000 unique headword proposals",()=>{eq(actual.total_raw_entries,321407);eq(actual.records.length,10000);eq(new Set(actual.records.map(r=>r.lookup_form_slp1)).size,10000);});
    check("REAL checksums, licence and all imported entry locators",()=>{
      for(const c of actual.catalogs){const d=path.join(real,"raw",c.data_revision);validateCatalog(c,fs.readFileSync(path.join(d,"LICENSE")));
        for(const s of c.sources){const bytes=fs.readFileSync(path.join(d,s.filename));eq(digest(bytes),s.sha256);
          const wanted=new Map(actual.records.flatMap(r=>r.source_evidence).filter(e=>e.source_id===s.id&&e.source_sha256===s.sha256).map(e=>[e.entry_id,e]));
          for(const e of parseCologne(bytes.toString(),s)){const ref=wanted.get(e.entry_id);if(ref){eq(ref.raw_markup,e.raw_markup);eq(ref.line_start,e.line_start);eq(ref.page_column,e.page_column);eq(ref.line_end,e.line_end);wanted.delete(e.entry_id);}}
          eq(wanted.size,0);
        }
      }
    });
    check("REAL no approval or publication inferred",()=>{eq(approved.records.length,0);const v=inventory(actual,approved);eq(v.mechanically_verified,10000);eq(v.actually_publishable,0);eq(v.quarantined_source_rows,1);});
    const dossier=JSON.parse(fs.readFileSync("data/content-intelligence/quality-reviews/f3b2-word-activities-evidence-dossier.json"));
    const review=pilotReviewPackage(actual,dossier);
    check("REAL three exact pilot copies pending, five independent review gates",()=>{eq(review.records.map(r=>r.word_id),["reflection","discernment","patience"]);assert(review.records.every(r=>!reviewedWordCopy(r.reviewed_publication_copy)&&r.reviewed_publication_copy.reviews.length===5&&r.production_approved===false));});
    check("REAL original pilot fields and draft IDs preserved",()=>{for(const r of review.records){const old=dossier.words.find(w=>w.word_id===r.word_id);eq(r.historical_draft_id,old.draft_id);eq(r.reviewed_publication_copy.content.reflection_en,old.original_copy.meaning_en);}});
    const observation=dossier.consolidated_production_preparation.final_release_review.internal_bank_qualification;
    check("REAL consolidated package matches bank counts and copy hashes",()=>{eq(observation.bank_commit,new PrivateLexicalStore(real).load().current);eq(observation.inventory.imported_headword_proposals,actual.records.length);for(const r of review.records)eq(observation.pilot_review_package.records.find(p=>p.word_id===r.word_id).copy_content_hash,snapshotHash(r.reviewed_publication_copy.content));});
    check("REAL publisher decisions are proposals, not approvals",()=>{assert(observation.publisher_decisions_required.every(r=>r.review_status==="pending"&&r.publisher_id===null&&r.approval_ref===null));eq(observation.runtime_activation,false);eq(observation.production_approved,false);eq(observation.public_output_allowed,false);eq(observation.inventory.ag70e_approved,0);});
    check("REAL AG70E evidence fields and source IDs retained",()=>{const schema=JSON.parse(fs.readFileSync("data/knowledge-base/word-of-day/production/knowledge-bank/lexical-source-evidence-map.json"));const refs=JSON.stringify(JSON.parse(fs.readFileSync("data/knowledge-base/word-of-day/production/knowledge-bank/sanskrit-lexical-source-reference-bank.json")));assert(actual.records.every(r=>r.source_evidence.every(e=>schema.required_fields.every(k=>Object.hasOwn(e,k))&&refs.includes('"'+e.source_reference_id+'"'))));});
  }
  console.log(JSON.stringify({checks,failures:0,synthetic_build_ms:Math.round(buildMs),real_corpus_checked:process.argv.includes("--real-root"),production_writes:0}));
}finally{fs.rmSync(dir,{recursive:true,force:true});}

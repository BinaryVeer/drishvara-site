import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { snapshotHash } from "./lib/ag70d-word-selection-engine.mjs";
import { DEFAULT_ROOT, PROJECT_ROOT, PrivateLexicalStore, digest, validateCatalog, buildCandidates,
  inventory, pilotReviewPackage, approvedEngineBank, assertPrivateRoot, exportPrivateBank, restorePrivateBank } from "./lib/ag70e-word-lexical-bank.mjs";

const relativeCatalog="data/knowledge-base/word-of-day/production/knowledge-bank/internal-lexical-source-catalog.json";
const dossierPath="data/content-intelligence/quality-reviews/f3b2-word-activities-evidence-dossier.json";
const read=file=>JSON.parse(fs.readFileSync(file,"utf8"));
function options(args){
  const out={};for(let i=0;i<args.length;i+=2){if(!/^--[a-z-]+$/.test(args[i])||args[i+1]===undefined||Object.hasOwn(out,args[i]))throw Error("invalid_arguments");out[args[i]]=args[i+1];}
  const known=["--root","--catalog","--limit","--query","--state","--out","--from","--id","--reason","--expected-version"];
  if(Object.keys(out).some(k=>!known.includes(k)))throw Error("unknown_argument");return out;
}
function safeFile(file){if(fs.existsSync(file)&&fs.lstatSync(file).isSymbolicLink())throw Error("private_file_symlink");return file;}
function saveNew(file,value){
  file=assertPrivateRoot(file);safeFile(file);fs.mkdirSync(path.dirname(file),{recursive:true,mode:0o700});
  fs.writeFileSync(file,JSON.stringify(value,null,2)+"\n",{flag:"wx",mode:0o600});return file;
}
async function download(url,file,hash){
  safeFile(file);if(fs.existsSync(file)){if(digest(fs.readFileSync(file))!==hash)throw Error("cached_checksum_mismatch");return "cached_checksum_verified";}
  const parsed=new URL(url);if(parsed.protocol!=="https:"||parsed.username||parsed.password)throw Error("unsafe_source_url");
  const response=await fetch(url,{redirect:"error",signal:AbortSignal.timeout(120000)});
  if(!response.ok)throw Error("source_http_"+response.status);const parts=[];let length=0;
  for await(const chunk of response.body){length+=chunk.length;if(length>150000000)throw Error("source_too_large");parts.push(chunk);}
  const bytes=Buffer.concat(parts);if(digest(bytes)!==hash)throw Error("download_checksum_mismatch");
  fs.writeFileSync(file,bytes,{flag:"wx",mode:0o600});return "downloaded_checksum_verified";
}
export async function runLexicalCommand(command,args){
  const opt=options(args),root=assertPrivateRoot(opt["--root"]??DEFAULT_ROOT);
  if(command==="restore"){if(!opt["--from"])throw Error("backup_path_required");return restorePrivateBank(opt["--from"],root);}
  const store=new PrivateLexicalStore(root),catalog=read(opt["--catalog"]??path.join(PROJECT_ROOT,relativeCatalog));
  const approved=()=>read(path.join(PROJECT_ROOT,catalog.ag70e_approved_bank_path));
  if(["acquire","ingest"].includes(command)){
    if(!/^[a-f0-9]{40}$/.test(catalog.data_revision))throw Error("invalid_data_revision");
    const raw=path.join(root,"raw",catalog.data_revision);safeFile(path.join(root,"raw"));safeFile(raw);fs.mkdirSync(raw,{recursive:true,mode:0o700});
    const licenseFile=path.join(raw,"LICENSE");
    if(command==="acquire")await download(catalog.license.url,licenseFile,catalog.license.sha256);
    validateCatalog(catalog,fs.readFileSync(safeFile(licenseFile)));
    const statuses=[];
    for(const s of catalog.sources){const file=safeFile(path.join(raw,s.filename));
      if(command==="acquire")statuses.push({source:s.id,status:await download(s.url,file,s.sha256),sha256:s.sha256});}
    if(command==="acquire")return {sources:statuses,license:catalog.license.id,public_output_allowed:false};
    const buffers=Object.fromEntries(catalog.sources.map(s=>[s.id,fs.readFileSync(safeFile(path.join(raw,s.filename)))]));
    const snapshot=buildCandidates(catalog,buffers,{limit:Number(opt["--limit"]??10000)}),current=store.append("import",snapshot);
    const notice={attribution:catalog.sources.map(s=>`${s.author}, ${s.title} (${s.year}); ${s.provider}.`),license:catalog.license,
      modifications:"Parsed source markup; NFC headwords; unaccented SLP1 converted mechanically to Devanagari and IAST. Sense markers and original accented keys retained; no translations inferred.",
      source_catalog_hash:snapshotHash(catalog),public_approval:false};
    const noticeFile=path.join(root,"NOTICE-"+digest(JSON.stringify(catalog))+".json");if(!fs.existsSync(noticeFile))saveNew(noticeFile,notice);
    return {current,...inventory(store.load().snapshot,approved())};
  }
  const loaded=store.load(),snapshot=loaded.snapshot;
  if(command==="status")return {current:loaded.current,...inventory(snapshot,approved())};
  if(command==="search"){
    const limit=Number(opt["--limit"]??20);if(!Number.isSafeInteger(limit)||limit<1||limit>100)throw Error("search_limit_1_to_100");
    const query=(opt["--query"]??"").normalize("NFC").toLowerCase(),state=opt["--state"];
    if(state&&!["CANDIDATE","VERIFIED","INELIGIBLE"].includes(state))throw Error("unsupported_private_state");
    const found=snapshot.records.filter(r=>(!state||r.internal_state===state)&&(!query||
      [r.lookup_form_slp1,r.devanagari,r.iast,...r.source_evidence.map(e=>e.raw_markup)].some(s=>s.toLowerCase().includes(query))));
    return {matched:found.length,records:found.slice(0,limit).map(r=>({record_id:r.record_id,version_hash:r.version_hash,
      headword:r.lookup_form_slp1,devanagari:r.devanagari,iast:r.iast,state:r.internal_state,
      source_entries:r.source_evidence.map(e=>({source_id:e.source_id,entry_id:e.entry_id,page_column:e.page_column,homograph:e.homograph_marker})),public_use_permission:r.public_use_permission}))};
  }
  if(command==="review-batch"){
    const review=pilotReviewPackage(snapshot,read(path.join(PROJECT_ROOT,dossierPath)));
    const out=assertPrivateRoot(opt["--out"]??path.join(root,"reviews","pilot-"+digest(JSON.stringify(review))+".json"));safeFile(out);
    if(fs.existsSync(out)){if(snapshotHash(read(out))!==snapshotHash(review))throw Error("review_copy_changed");}
    else saveNew(out,review);
    return {path:out,sha256:digest(fs.readFileSync(out)),records:review.records.length,approved:0,public_output_allowed:false};
  }
  if(command==="prepare-engine-bank"){
    const bank=approvedEngineBank(snapshot,approved()),out=assertPrivateRoot(opt["--out"]??path.join(root,"exports","engine-"+digest(JSON.stringify(bank))+".json"));safeFile(out);
    if(!fs.existsSync(out))saveNew(out,bank);else if(snapshotHash(read(out))!==snapshotHash(bank))throw Error("engine_export_changed");
    return {path:out,records:bank.records.length,runtime_activation:false,public_output_allowed:false};
  }
  if(["withdraw","correct"].includes(command)){
    if(!opt["--expected-version"])throw Error("expected_version_required");
    return {current:store.change(command,opt["--id"],opt["--reason"],opt["--expected-version"]),publication_enabled:false};
  }
  if(command==="export"){if(!opt["--out"])throw Error("private_output_required");return exportPrivateBank(store,opt["--out"]);}
  throw Error("commands: acquire, ingest, status, search, review-batch, prepare-engine-bank, withdraw, correct, export, restore");
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
  try{console.log(JSON.stringify(await runLexicalCommand(process.argv[2],process.argv.slice(3)),null,2));}
  catch(error){console.error("Private lexical bank: "+error.message);process.exitCode=1;}
}

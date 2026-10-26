import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import { DEFAULT_ROOT, PrivateLexicalStore, assertPrivateRoot, digest, transliterateSlp1, devanagariToSlp1 } from "./lib/ag70e-word-lexical-bank.mjs";
import { canonicalJson, snapshotHash, MINIMUM_WORD_CONTRACT, MINIMUM_WORD_POLICY_REF, MINIMUM_WORD_APPROVAL_REF } from "./lib/ag70d-word-selection-engine.mjs";
import { prepareFullBankResearch } from "./lib/ag70e-word-research-preparation.mjs";

// Editorial curation and review preparation only. Never a daily selector or approval writer.
const catalogPath="data/knowledge-base/word-of-day/production/knowledge-bank/internal-lexical-source-catalog.json";
const read=p=>JSON.parse(fs.readFileSync(p,"utf8"));
function csv(file){
  const result=spawnSync("python3",["-c","import csv,json,sys; print(json.dumps(list(csv.DictReader(open(sys.argv[1],encoding='utf-8-sig',newline=''))),ensure_ascii=False))",file],{encoding:"utf8",maxBuffer:20000000});
  if(result.status!==0)throw Error("csv_parse_failed");return JSON.parse(result.stdout);
}
const clean=value=>value.replace(/<[^>]*>/g," ").replace(/\s+/g," ").trim();
const pending=()=>({review_status:"pending",reviewer_id:null,approval_ref:null});
const firstNotes=[
  ["Reflection makes room to consider before responding.","प्रतिक्रिया से पहले विचार के लिए स्थान बनाना भी सीखने का भाग है।"],
  ["Careful judgement begins by noticing distinctions.","सूक्ष्म भेदों को पहचानना विचारपूर्ण निर्णय का एक आधार है।"],
  ["Patience need not mean inaction.","धैर्य का अर्थ आवश्यक कार्रवाई छोड़ देना नहीं है।"],
  ["Attention can be directed towards one subject at a time.","ध्यान को एक समय में एक विषय पर केंद्रित किया जा सकता है।"],
  ["Effort names the work of trying, not a promise of success.","प्रयत्न कोशिश को व्यक्त करता है, सफलता की गारंटी को नहीं।"],
  ["Beauty can be noticed without making it a measure of a person's worth.","सुंदरता को देखना किसी व्यक्ति का मूल्य तय करना नहीं है।"],
  ["An instructor helps make a subject accessible to a learner.","शिक्षक किसी विषय को सीखने वाले के लिए सुगम बनाता है।"],
  ["Recollection brings something previously known back to attention.","स्मरण पहले जानी हुई बात को फिर ध्यान में लाता है।"],
  ["Education describes learning acquired, not an inherited rank.","शिक्षित होना अर्जित अध्ययन से जुड़ा है, जन्म से मिले दर्जे से नहीं।"],
  ["Learning is an activity, not merely a completed result.","सीखना केवल अंतिम परिणाम नहीं, एक चलती हुई प्रक्रिया भी है।"],
  ["A name helps identify something without exhausting what it is.","नाम पहचान में सहायता करता है, पर पूरी वास्तविकता को नहीं समेटता।"],
  ["Consideration leaves room to look again before deciding.","सोच-विचार निर्णय से पहले दोबारा देखने का अवसर देता है।"],
  ["Here beauty is the selected lexical sense, not a universal ideal.","यहाँ सुंदरता शब्द का चुना हुआ अर्थ है, कोई सार्वभौम आदर्श नहीं।"],
  ["Friendship names a relationship, not a demand for agreement.","मित्रता संबंध को व्यक्त करती है, हर बात पर सहमत होने की शर्त को नहीं।"],
  ["Radiance offers a word for brightness and splendour.","उज्ज्वलता चमक और दीप्ति को व्यक्त करने वाला शब्द है।"],
  ["Composure can coexist with taking necessary action.","शांत और संयत रहते हुए भी आवश्यक कदम उठाए जा सकते हैं।"],
  ["Occupation gives language to the work that engages someone.","व्यवसाय या कार्य उस काम को व्यक्त करता है जिसमें कोई लगा हो।"],
  ["Industry here means diligence, not a branch of manufacturing.","यहाँ अर्थ परिश्रमशीलता है, उत्पादन का कोई औद्योगिक क्षेत्र नहीं।"],
  ["Protection concerns care and preservation.","रक्षा देखभाल और संरक्षण से संबंधित है।"],
  ["What is delightful may differ between people and situations.","जो आनंददायक लगे वह व्यक्ति और परिस्थिति के अनुसार बदल सकता है।"],
  ["Humility need not require silence about harm or unfairness.","विनम्रता का अर्थ हानि या अन्याय पर मौन रहना नहीं है।"],
  ["Suitability asks whether something fits its setting.","उपयुक्तता किसी बात का उसके प्रसंग से मेल देखती है।"],
  ["Understanding involves more than repeating familiar words.","समझ केवल परिचित शब्द दोहराने तक सीमित नहीं है।"],
  ["Creating in the mind need not be a statement about external fact.","मन में कोई रूप बनाना बाहरी तथ्य का दावा करना नहीं है।"],
  ["This expression places someone in the company of friends.","यह अभिव्यक्ति किसी के मित्रों के साथ होने को बताती है।"],
  ["Justice concerns how a decision is reached as well as its result.","न्याय परिणाम के साथ निर्णय की प्रक्रिया से भी संबंधित है।"],
  ["This selected sense concerns the reality of things, not a claim of infallibility.","यह चुना हुआ अर्थ वस्तुओं के यथार्थ से जुड़ा है, अचूक होने के दावे से नहीं।"],
  ["Delight can be a small, ordinary experience.","आनंद कोई छोटी और साधारण अनुभूति भी हो सकता है।"],
  ["Kindness offers a way to describe goodwill towards others.","सद्भावना दूसरों के प्रति भले भाव को व्यक्त करती है।"],
  ["Prudence brings thoughtful care to a choice.","विवेकपूर्ण सावधानी किसी चुनाव में सोच-विचार को स्थान देती है।"]
];

export function makeQualification({snapshot,seeds,shortlist,inputs}){
  if(seeds.length!==365||new Set(seeds.map(r=>r[0])).size!==365)throw Error("requires_365_distinct_curated_forms");
  const catalog=read(catalogPath),sourceById=new Map(catalog.sources.map(s=>[s.id,s]));
  const records=seeds.map(([form,entry,english,hindi],i)=>{
    const local=snapshot.records.find(r=>r.lookup_form_slp1===form);if(!local||local.withdrawn||local.internal_state!=="VERIFIED")throw Error("unavailable_curated_form:"+form);
    const evidence=local.source_evidence.filter(e=>e.entry_id===entry);
    if(evidence.length!==1||!clean(evidence[0].raw_markup).toLowerCase().includes(english.toLowerCase()))throw Error("unresolved_selected_sense:"+form);
    const e=evidence[0],source=sourceById.get(e.source_id),forms=transliterateSlp1(form);
    if(forms.devanagari!==local.devanagari||forms.iast!==local.iast||devanagariToSlp1(forms.devanagari)!==form||!hindi?.trim())throw Error("inconsistent_lexical_form");
    const content={english:english[0].toUpperCase()+english.slice(1),hindi,sanskrit:forms.devanagari,iast:forms.iast,
      meaning_en:`Selected sense: ${english}.`,meaning_hi:`चुने हुए अर्थ में: ${hindi}।`,
      reflection_en:firstNotes[i]?.[0]??`Here, ${forms.iast} is presented in the sense “${english}”; other senses are not implied.`,
      reflection_hi:firstNotes[i]?.[1]??`${forms.devanagari} को यहाँ “${hindi}” अर्थ में लिया गया है; दूसरे अर्थ अभिप्रेत नहीं हैं।`,
      sources:[{evidence_ref:e.evidence_id,title:source.title,publisher:source.provider,url:source.url,
        attribution:`${source.author}, ${source.year}; ${source.provider}; entry ${entry}, p./col. ${e.page_column}; CC BY-SA 4.0 (https://creativecommons.org/licenses/by-sa/4.0/). Source sense excerpted; Hindi gloss and editorial framing are proposed adaptations.`,
        review_status:"pending",reuse_approval_ref:null}]};
    const hash=snapshotHash(content),priority=i<30;
    const record={research_candidate_id:local.record_id+"@curation-v2",curation_rank:i+1,review_priority:priority?"initial_30":"annual_candidate",proposed_order_is_daily_selection_authority:false,
      lexical_bank_ref:{record_id:local.record_id,version_hash:local.version_hash},lookup_form_slp1:form,
      origin_in_supplied_shortlist:shortlist.has(local.record_id),source_evidence:{...e,selected_sense_literal:english,source_body_hash:snapshotHash(e.raw_markup)},
      source_scope:"Pinned digital dictionary transcription; no new independent primary-scan authentication or literary citation verification claimed.",
      selected_sense_status:"source_attested_candidate_pending_qualified_review",hindi_status:"AI_assisted_editorial_translation_not_authenticated_Hindi_equivalent",
      display_form_status:"Exact source lookup form; inflected forms are not silently converted to lemmas.",
      iast_status:"mechanical_transliteration_pending_qualified_review",morphology_status:"pending",semantics_status:"pending",etymology_status:"not_claimed",
      original_editorial_copy_status:"AI_assisted_original_draft_not_traditional_quotation_or_human_approval",
      reviewed_publication_copy:{contract_version:"ag70e.word-copy.v1",version:"curated-word-copy-v2",content,iast_review_status:"pending",iast_approval_ref:null,
        reviews:["linguistic","editorial","rights","context","safety"].map(kind=>({...pending(),kind,content_hash:hash}))},
      minimum_publication_contract:{contract_version:MINIMUM_WORD_CONTRACT,policy_ref:MINIMUM_WORD_POLICY_REF,policy_approval_ref:MINIMUM_WORD_APPROVAL_REF,
        copy_content_hash:hash,etymological_claim_displayed:false,claim_review_ref:null,claim_evidence_refs:[]},
      review_findings:{source_entry_and_selected_gloss:"inspected_in_this_execution",mechanical_spelling_and_iast:"passed",source_licence:"CC-BY-SA-4.0 observed; attribution and ShareAlike handling need exact-use review",
        preliminary_source_sense_review:priority?"AI_assisted_completed_not_a_qualified_linguistic_signoff":"source_attestation_checked_qualified_review_pending",
        exceptions:["Sanskrit morphology and contextual sense approval pending","Hindi explanation and displayed IAST review pending","Exact public-copy, attribution/source-use, context and safety approval pending","Canonical identity/equivalence and authorized ordering pending"]},
      production_approved:false,approved_for_daily_output:false,public_use_permission:"not_allowed",public_output_allowed:false,runtime_activation:false};
    return {...record,record_hash:snapshotHash(record)};
  });
  const manifest=records.map(r=>({research_candidate_id:r.research_candidate_id,record_hash:r.record_hash,copy_hash:r.minimum_publication_contract.copy_content_hash}));
  return {contract_version:"ag70e.content-qualification-package.v1",prepared_on:"2026-10-25",baseline:"1d6666a4d8bcec2bcd1e32a8adcd3995469c7ebf",
    lexical_bank_commit:inputs.bank_commit,input_file_receipts:inputs.receipts,input_seed_rows:seeds,
    source_licence_boundary:"Private CC BY-SA corpus; no restricted DSAL prose copied. Captured licence is not a human exact-use review.",
    qualification_note:"Curation is an editorial research proposal, not a production approved bank or a 365-date schedule. No linguistic sign-off is inferred from AI source analysis.",
    counts:{curated:365,from_structural_shortlist:records.filter(r=>r.origin_in_supplied_shortlist).length,initial_release_review_priority:30,
      preliminary_AI_source_sense_reviews:30,qualified_linguistic_reviews:0,publisher_approved_words:0,publishable:0},
    records,manifest_hash:snapshotHash(manifest),public_output_allowed:false,runtime_activation:false,status:"NOT LIVE"};
}
export function approvalRegister(pack){
  return {contract_version:"ag70e.word-batch-review.v1",package_manifest_hash:pack.manifest_hash,
    approval_semantics:"Blank or pending cells never authorize selection. Genuine review decisions must bind these exact copy/record hashes and remain independently registrable through existing AG70E contracts.",
    rows:pack.records.map(r=>({research_candidate_id:r.research_candidate_id,priority:r.review_priority,sanskrit:r.reviewed_publication_copy.content.sanskrit,
      record_hash:r.record_hash,copy_content_hash:r.minimum_publication_contract.copy_content_hash,source_evidence_ref:r.source_evidence.evidence_id,
      linguistic:pending(),morphology:pending(),hindi:pending(),iast:pending(),source_use:pending(),editorial:pending(),context:pending(),safety:pending(),publisher_exact_copy:pending(),
      unresolved_exceptions:r.review_findings.exceptions,etymology_disposition:"No claim displayed; authorized conditional policy does not grant linguistic approval.",
      eligible_for_daily_selection:false})),public_output_allowed:false,runtime_activation:false};
}
function immutable(root,prefix,data){
  const bytes=canonicalJson(data)+"\n",file=path.join(root,prefix+"-"+digest(bytes)+".json");
  if(fs.existsSync(file)){if(fs.readFileSync(file,"utf8")!==bytes)throw Error("immutable_artifact_mismatch");}
  else fs.writeFileSync(file,bytes,{flag:"wx",mode:0o600});return {path:file,sha256:digest(bytes),bytes:Buffer.byteLength(bytes)};
}
export function firstThirtyReviewMarkdown(pack){
  const out=["# First 30 Word Candidates: Exact-Copy Review", "", "All word-level approvals are PENDING. These are AI-assisted drafts, not completed qualified reviews. The approved etymology-policy amendment does not approve any word.", "", "The order below is a proposed review order, not an approved daily-publication order."];
  for(const r of pack.records.slice(0,30)){const c=r.reviewed_publication_copy.content;
    out.push("",`## ${r.curation_rank}. ${c.sanskrit} (${c.iast})`,"",`Candidate: ${r.research_candidate_id}`,`Copy hash: ${r.minimum_publication_contract.copy_content_hash}`,"",
      `English label: ${c.english}`,`Proposed Hindi gloss: ${c.hindi}`,`English explanation: ${c.meaning_en}`,`Hindi explanation: ${c.meaning_hi}`,"",c.reflection_en,c.reflection_hi,"",
      `Source: ${c.sources[0].title}; ${c.sources[0].publisher}; entry ${r.source_evidence.entry_id}; page/column ${r.source_evidence.page_column}; lines ${r.source_evidence.line_start}-${r.source_evidence.line_end}.`,
      `Selected attested English fragment: ${r.source_evidence.selected_sense_literal}`,`Source URL: ${c.sources[0].url}`,"",
      "Required decisions: linguistic/morphology; Hindi; displayed IAST; source-use and attribution; editorial; context; safety; publisher exact copy. All pending.",
      "Etymology: no etymological claim proposed. The reviewed-copy declaration still requires qualified linguistic approval.","",
      ...r.review_findings.exceptions.map(s=>"- "+s));
  }return out.join("\n")+"\n";
}
export function prepareQualification({root=DEFAULT_ROOT,seedsFile,shortlistFile,allFile,auditFile}){
  const store=new PrivateLexicalStore(root),loaded=store.load(),byId=new Map(loaded.snapshot.records.map(r=>[r.record_id,r]));
  const shortlistRows=csv(shortlistFile),all=csv(allFile),audit=read(auditFile);
  if(shortlistRows.length!==608||all.length!==10000||new Set(all.map(r=>r.record_id)).size!==10000||new Set(shortlistRows.map(r=>r.record_id)).size!==608||audit.entries!==10000)throw Error("supplied_inventory_shape_mismatch");
  for(const r of all){const local=byId.get(r.record_id);if(!local||r.devanagari!==local.devanagari||r.iast!==local.iast||r.version_hash!==local.version_hash)throw Error("supplied_inventory_does_not_match_bank");}
  for(const r of shortlistRows){const local=byId.get(r.record_id);if(!local||r.sanskrit!==local.devanagari||r.iast!==local.iast)throw Error("shortlist_identity_mismatch");}
  const seedText=fs.readFileSync(seedsFile,"utf8"),seeds=seedsFile.endsWith(".json")?read(seedsFile).input_seed_rows:seedText.trim().split(/\r?\n/).map(line=>line.normalize("NFC").split("|"));
  if(seeds.some(r=>r.length!==4||r.some(s=>!s.trim())))throw Error("invalid_curated_seed_fields");
  const receipts=[shortlistFile,allFile,auditFile,seedsFile].map(p=>({path:p,sha256:digest(fs.readFileSync(p))}));
  const pack=makeQualification({snapshot:loaded.snapshot,seeds,shortlist:new Set(shortlistRows.map(r=>r.record_id)),inputs:{bank_commit:loaded.current,receipts}});
  const out=assertPrivateRoot(path.join(root,"reviews","content-qualification"));fs.mkdirSync(out,{recursive:true,mode:0o700});
  const packageReceipt=immutable(out,"curated-365",pack),registerReceipt=immutable(out,"batch-approval",approvalRegister(pack));
  const reviewText=firstThirtyReviewMarkdown(pack),reviewFile=path.join(out,"first-30-review-"+digest(reviewText)+".md");
  if(!fs.existsSync(reviewFile))fs.writeFileSync(reviewFile,reviewText,{flag:"wx",mode:0o600});
  else if(fs.readFileSync(reviewFile,"utf8")!==reviewText)throw Error("immutable_review_mismatch");
  if(store.load().current!==loaded.current)throw Error("bank_changed_during_qualification");
  return {package:packageReceipt,approval_register:registerReceipt,first_30_review:{path:reviewFile,sha256:digest(reviewText)},...pack.counts,bank_unchanged:true,status:"NOT LIVE"};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
  try{const [seedsFile,shortlistFile,allFile,auditFile]=process.argv.slice(2);
    const result=seedsFile==="--full-bank"?prepareFullBankResearch({curatedFile:shortlistFile,submissionsFile:allFile??null}):prepareQualification({seedsFile,shortlistFile,allFile,auditFile});
    console.log(JSON.stringify(result,null,2));}
  catch(error){console.error(error.message);process.exitCode=1;}
}

import assert from "node:assert/strict";
import fs from "node:fs";
import { PrivateLexicalStore, DEFAULT_ROOT } from "./lib/ag70e-word-lexical-bank.mjs";
import { snapshotHash, copySnapshot, validApprovedRecord, validEtymologyQualification, MINIMUM_WORD_CONTRACT, MINIMUM_WORD_POLICY_REF, MINIMUM_WORD_APPROVAL_REF } from "./lib/ag70d-word-selection-engine.mjs";
import { reviewedWordCopy } from "./lib/ag70e-word-publication-pipeline.mjs";
import { syntheticWord } from "./lib/ag70e-word-test-fixtures.mjs";
import { approvalRegister, firstThirtyReviewMarkdown } from "./prepare-word-content-qualification.mjs";

let checks=0;const check=(name,run)=>{run();checks++;console.log("PASS "+name);};
const config=JSON.parse(fs.readFileSync("data/knowledge-base/word-of-day/production/methodology/ag70d-word-release-configuration.json"));
const amendment=config.minimum_publication_contract_amendment;
check("actual narrow publisher decision recorded, not a word or operational approval",()=>{
  assert.equal(amendment.contract_version,MINIMUM_WORD_CONTRACT);assert.equal(amendment.record_ref,MINIMUM_WORD_POLICY_REF);
  assert.equal(amendment.approval_ref,MINIMUM_WORD_APPROVAL_REF);assert.equal(amendment.review_status,"approved");
  assert.equal(amendment.runtime_activation,false);assert.equal(amendment.public_output_allowed,false);
  assert.equal(config.publication.review_status,"pending");assert.equal(config.scheduler.enabled,false);assert.equal(config.persistence.enabled,false);
});
check("SQL policy payload pin matches the actual authorized contract",()=>{
  const sql=fs.readFileSync("supabase/migrations/20261025000000_word_claim_conditional_etymology.sql","utf8");
  assert(sql.includes(snapshotHash(amendment)));assert(sql.includes("word_etymology_migration_definition_mismatch"));assert(sql.includes("revoke all"));
  assert(!/insert into|update drishvara_word_private.controls|cron\.schedule|grant execute/i.test(sql));
});
const sample=syntheticWord(1),claimRef=sample.reviewed_publication_copy.reviews.find(r=>r.kind==="linguistic").approval_ref;
sample.approval_record_refs.push(claimRef);sample.etymology_status="not_claimed";
sample.minimum_publication_contract={contract_version:MINIMUM_WORD_CONTRACT,policy_ref:MINIMUM_WORD_POLICY_REF,policy_approval_ref:MINIMUM_WORD_APPROVAL_REF,
  copy_content_hash:snapshotHash(sample.reviewed_publication_copy.content),etymological_claim_displayed:false,claim_review_ref:claimRef,claim_evidence_refs:[]};
check("synthetic qualified semantic-only record: no etymology claim required",()=>{assert(validApprovedRecord(sample));assert(reviewedWordCopy(sample.reviewed_publication_copy));});
check("legacy established record unchanged",()=>assert(validApprovedRecord(syntheticWord(1))));
check("legacy unverified record is not silently upgraded",()=>{const r=syntheticWord(1);r.etymology_status="not_claimed";assert(!validApprovedRecord(r));});
const rejects=(name,edit)=>check(name,()=>{const r=copySnapshot(sample);edit(r);assert(!validApprovedRecord(r));});
rejects("unknown contract version rejected",r=>r.minimum_publication_contract.contract_version="unknown");
rejects("unknown nested qualification key rejected",r=>r.minimum_publication_contract.override=true);
rejects("null qualification rejected",r=>r.minimum_publication_contract=null);
rejects("forged policy ref rejected",r=>r.minimum_publication_contract.policy_ref="unapproved");
rejects("forged policy approval ref rejected",r=>r.minimum_publication_contract.policy_approval_ref="unapproved");
rejects("string false cannot substitute for boolean false",r=>r.minimum_publication_contract.etymological_claim_displayed="false");
rejects("missing declaration approval rejected",r=>r.minimum_publication_contract.claim_review_ref=null);
rejects("wrong declaration reviewer binding rejected",r=>r.minimum_publication_contract.claim_review_ref="different");
rejects("pending linguistic review cannot attest no-claim",r=>r.reviewed_publication_copy.reviews[0].review_status="pending");
rejects("changed public copy invalidates no-claim declaration",r=>r.reviewed_publication_copy.content.meaning_en="Changed copy");
rejects("unknown etymology status rejected",r=>r.etymology_status="unverified");
rejects("claim cannot use semantic-only status",r=>r.minimum_publication_contract.etymological_claim_displayed=true);
rejects("claim needs independently approved evidence",r=>{r.etymology_status="established";r.minimum_publication_contract.etymological_claim_displayed=true;});
rejects("claim evidence cannot point to another source",r=>{r.etymology_status="established";r.minimum_publication_contract.etymological_claim_displayed=true;r.minimum_publication_contract.claim_evidence_refs=["wrong"];
});
check("synthetic displayed claim still needs established etymology and matching source",()=>{
  const r=copySnapshot(sample);r.etymology_status="established";r.minimum_publication_contract.etymological_claim_displayed=true;r.minimum_publication_contract.claim_evidence_refs=["synthetic-source"];
  assert(validEtymologyQualification(r));r.source_evidence[0].review_status="pending";assert(!validApprovedRecord(r));
});
for(const [field,value]of [["production_approved",false],["approved_for_daily_output",false],["morphology_status","pending"],["semantics_status","pending"],["public_use_permission","not_allowed"]])rejects("other mandatory gate unchanged: "+field,r=>r[field]=value);
check("pending IAST and exact-copy rights cannot publish",()=>{const r=copySnapshot(sample);r.reviewed_publication_copy.iast_review_status="pending";assert(!reviewedWordCopy(r.reviewed_publication_copy));r.reviewed_publication_copy.iast_review_status="approved";r.reviewed_publication_copy.reviews.find(x=>x.kind==="rights").review_status="pending";assert(!reviewedWordCopy(r.reviewed_publication_copy));});

const [packPath,registerPath]=process.argv.slice(2);
if(!packPath||!registerPath)throw Error("provide_private_package_and_register_paths");
const pack=JSON.parse(fs.readFileSync(packPath)),register=JSON.parse(fs.readFileSync(registerPath));
const loaded=new PrivateLexicalStore(DEFAULT_ROOT).load(),rows=pack.records;
check("365 unique curated identities bound to the unchanged 10,000-word corpus",()=>{
  assert.equal(rows.length,365);assert.equal(new Set(rows.map(r=>r.lexical_bank_ref.record_id)).size,365);
  assert.equal(loaded.current,pack.lexical_bank_commit);assert.equal(loaded.snapshot.records.length,10000);
  for(const r of rows)assert.equal(r.lexical_bank_ref.version_hash,loaded.snapshot.records.find(b=>b.record_id===r.lexical_bank_ref.record_id).version_hash);
});
check("selected exact source senses, hashes, locators and private provenance resolve",()=>{
  assert.equal(pack.manifest_hash,snapshotHash(rows.map(r=>({research_candidate_id:r.research_candidate_id,record_hash:r.record_hash,copy_hash:r.minimum_publication_contract.copy_content_hash}))));
  for(const r of rows){const source=loaded.snapshot.records.find(b=>b.record_id===r.lexical_bank_ref.record_id).source_evidence.find(e=>e.evidence_id===r.source_evidence.evidence_id);
    assert(source);assert.equal(snapshotHash(source.raw_markup),r.source_evidence.source_body_hash);
    assert(source.raw_markup.replace(/<[^>]*>/g," ").replace(/\s+/g," ").toLowerCase().includes(r.source_evidence.selected_sense_literal.toLowerCase()));
    const value=copySnapshot(r);delete value.record_hash;assert.equal(snapshotHash(value),r.record_hash);
    assert.equal(snapshotHash(r.reviewed_publication_copy.content),r.minimum_publication_contract.copy_content_hash);
  }
});
check("30 initial review priorities have exact bilingual copy and pending qualified reviews",()=>{
  assert.equal(rows.filter(r=>r.review_priority==="initial_30").length,30);assert.equal(pack.counts.preliminary_AI_source_sense_reviews,30);assert.equal(pack.counts.qualified_linguistic_reviews,0);
  for(const r of rows.slice(0,30)){const c=r.reviewed_publication_copy.content;for(const k of ["sanskrit","iast","english","hindi","meaning_en","meaning_hi","reflection_en","reflection_hi"])assert(c[k]);
    assert(r.hindi_status.includes("not_authenticated"));assert.equal(r.morphology_status,"pending");
  }
});
check("all 365 remain rejected by existing eligibility/export/public-copy gates",()=>{
  assert(rows.every(r=>!validApprovedRecord(r)&&!reviewedWordCopy(r.reviewed_publication_copy)&&!r.production_approved&&!r.public_output_allowed&&!r.runtime_activation));
  assert.equal(pack.counts.publisher_approved_words,0);assert.equal(pack.counts.publishable,0);assert.equal(pack.status,"NOT LIVE");
});
check("batch register identifies every hash and contains no fabricated sign-offs",()=>{
  assert.deepEqual(register,approvalRegister(pack));
  assert(register.rows.every(r=>["linguistic","morphology","hindi","iast","source_use","editorial","context","safety","publisher_exact_copy"].every(k=>r[k].review_status==="pending"&&r[k].approval_ref===null&&r[k].reviewer_id===null)));
});
check("365 proposed no-claim declarations do not authenticate etymology",()=>{assert(rows.every(r=>r.minimum_publication_contract.etymological_claim_displayed===false&&r.minimum_publication_contract.claim_review_ref===null&&r.etymology_status==="not_claimed"));});
check("first-30 readable package preserves the immutable hashes",()=>{const md=firstThirtyReviewMarkdown(pack);assert(rows.slice(0,30).every(r=>md.includes(r.minimum_publication_contract.copy_content_hash)));});
check("AG70E approved bank empty; no raw-corpus approval fields changed",()=>{
  const bank=JSON.parse(fs.readFileSync("data/knowledge-base/word-of-day/production/knowledge-bank/approved-output-candidate-bank.json"));assert.equal(bank.records.length,0);
  assert(loaded.snapshot.records.every(r=>r.production_approved===false&&r.public_use_permission==="not_allowed"&&r.etymology_status==="unverified"));
});
console.log(JSON.stringify({checks,failures:0,curated:365,AI_preliminary_reviews:30,qualified_reviews:0,publisher_approved_words:0,publishable:0,hosted_writes:0,status:"NOT LIVE"}));

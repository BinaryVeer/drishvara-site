import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { snapshotHash } from "./lib/ag70d-word-selection-engine.mjs";
import { syntheticWord, withSyntheticMeaning } from "./lib/ag70e-word-test-fixtures.mjs";
import { validateWordRegistration, registerReviewedWord } from "./lib/editorial-word-registration.mjs";

let checks = 0;
async function check(label, run) { await run(); checks++; console.log("PASS synthetic registration: " + label); }
const command = { action: "register_word", command_id: randomUUID(), candidate_id: randomUUID(), version_id: randomUUID(), content_hash: "sha256:" + "a".repeat(64),
  metadata: { canonical_lexical_identity_id: "synthetic:identity", lemma_id: "synthetic:lemma", equivalence_group_id: "synthetic:equivalence", context_signal_id: "synthetic:context", no_etymological_claim: true }, note: "Synthetic personally reviewed identity mapping only." };
const session = { is_administrator: true }, sample = withSyntheticMeaning(syntheticWord(1));
const internal = value => ({ ...value, public_output_allowed: false, runtime_activation: false });
await check("exact metadata is accepted without caller approval flags", () => assert.equal(validateWordRegistration(command), null));
for (const field of ["role", "actor_id", "approved", "record", "source_approvals"]) await check("reject caller authority " + field, () =>
  assert.equal(validateWordRegistration({ ...command, [field]: true }), "invalid_word_registration"));
for (const metadata of [{}, { ...command.metadata, no_etymological_claim: false }, { ...command.metadata, lemma_id: " " }, { ...command.metadata, approved: true }])
  await check("incomplete or approval-bearing metadata remains pending", () => assert.equal(validateWordRegistration({ ...command, metadata }), "word_registration_metadata_pending"));
await check("non-Admin cannot invoke registration even with syntactically valid input", async () => {
  const r = await registerReviewedWord({ command, session: {}, rpc: () => assert.fail("must not call RPC") }); assert.equal(r.code, "workspace_administrator_required");
});
await check("pending database reviews do not reach registration", async () => {
  let calls = 0; const r = await registerReviewedWord({ command, session, rpc: async () => { calls++; return internal({ ok: false, code: "editorial_reviews_pending" }); } });
  assert.equal(r.code, "editorial_reviews_pending"); assert.equal(calls, 1);
});
await check("valid synthetic record is prepared and rechecked by the authenticated database", async () => {
  const calls = []; const hash = snapshotHash(sample);
  const r = await registerReviewedWord({ command, session, rpc: async (name, args) => {
    assert.equal(name, "editorial_word_registration"); calls.push(args.p_command);
    return args.p_command.action === "prepare" ? internal({ ok: true, record: sample, record_hash: hash }) :
      internal({ ok: true, status: "approved_bank_registered", candidate_ref: "synthetic-only@v1", record_hash: hash });
  } });
  assert.equal(calls.length, 2); assert.equal(calls[1].expected_record_hash, hash); assert.equal(calls[1].content_hash, command.content_hash);
  assert.equal(r.status, "approved_bank_registered"); assert.equal(r.public_output_allowed, false); assert.equal(r.runtime_activation, false);
});
for (const mutate of [r => { r.production_approved = false; }, r => { r.reviewed_publication_copy.reviews[0].review_status = "pending"; },
  r => { r.reviewed_publication_copy.content.sources[0].review_status = "pending"; }, r => { r.reviewed_publication_copy.content.meaning_details.philosophical_essay.sections[0].body_en += " Tampered"; }]) {
  await check("existing engine/copy gates reject pending or tampered prepared records", async () => {
    const record = structuredClone(sample); mutate(record); let calls = 0;
    const r = await registerReviewedWord({ command, session, rpc: async () => { calls++; return internal({ ok: true, record, record_hash: snapshotHash(record) }); } });
    assert.equal(r.code, "word_registration_copy_unapproved"); assert.equal(calls, 1);
  });
}
await check("wrong prepared hash cannot register even an otherwise valid copy", async () => {
  const r = await registerReviewedWord({ command, session, rpc: async () => internal({ ok: true, record: sample, record_hash: "wrong" }) });
  assert.equal(r.code, "word_registration_copy_unapproved");
});
await check("changed database receipt never reports registration success", async () => {
  const r = await registerReviewedWord({ command, session, rpc: async (_name, { p_command }) => p_command.action === "prepare" ?
    internal({ ok: true, record: sample, record_hash: snapshotHash(sample) }) : internal({ ok: false, code: "word_registration_changed" }) });
  assert.equal(r.ok, false); assert.equal(r.code, "word_registration_changed");
});
console.log(`Word registration: ${checks} synthetic checks passed; no hosted approvals, bank imports or publication.`);

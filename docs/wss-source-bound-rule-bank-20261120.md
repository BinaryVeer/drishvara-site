# WSS source-bound rule bank, 20 November 2026

The private evaluator now has 38 unique bilingual rules: 10 house topics, seven sign-level dignity classifications, seven full graha-aspect geometries, seven Navāṁśa vocation associations and seven planetary complexion descriptors. These are factors and contextual traditional associations, not an activated personal prediction service. The existing five-entry legacy evidence view is preserved.

## Source doctrine and evidence limits

M00 and AD01 remain authoritative. Nityanand Misra's textual discipline is an influence; no particular horoscope algorithm, review, approval or endorsement is attributed to him. Naming texts are not horoscope authorities. Regional and lineage-specific rules require their own applicability records rather than being merged into a supposedly universal method.

The machine-readable bank records work, passage, digital edition limitation, two or more carrier links, check date, prerequisites, exclusions and English/Hindi prose for each family. Digital carriers are not independent editions. The current source checks are passage-level research, not independent Sanskrit recension or bilingual editorial approval. All publication flags remain false.

| Family | Passage | Implemented scope |
| --- | --- | --- |
| House topics | BPHS 11.2–13, qualified by 11.14–16 | Selected safe topic labels; no house-only outcome |
| Dignity | BPHS 3.49–50 | Seven visible grahas, exaltation and opposite debilitation sign only |
| Aspects | BPHS 26.3–5 | Full sign-level graha aspects; no exact angular strength or node-aspect assumption |
| Vocation | Bṛhat Jātaka 10.1–4 | Lagna/Moon/Sun → tenth sign → tenth lord → that lord's D9 sign → D9 sign lord |
| Colour symbolism | BPHS 3.16–17, compared with Bṛhat Jātaka 2.4 | Complexion vocabulary; no lucky-colour, preference or clothing prescription |

Vocation is a non-exhaustive paraphrase of selected livelihood terms. Ambiguous terms and historical caste-ranked categories are not converted into personal assertions. No strongest origin is selected without a strength model. Modern occupation analogies are not silently equated with the classical descriptions. Jupiter's complexion is recorded as fair, without inventing a golden-colour prescription.

## Evaluation and precision

The shared audit contract retains the existing UTC, timezone version/checksum, coordinates and complete birth-clock interval binding. The new evaluator checks nine unique grahas and sign agreement against the audit. Lagna-dependent rules require a stable D1 basis. A vocation path requires a stable origin and a matching stable D9 assignment for the relevant tenth lord. Uncertain target grahas are excluded from aspect occupant lists. Symbolic colour definitions are explicitly non-personal textual information.

The QA preview renders the bank in collapsible English/Hindi entries, with passage links and the full vocation chain when qualified. It does not publish a new public horoscope or persist birth details.

## Unresolved families

- Transit vedha: Mercury's eleventh-house obstruction differs in digital translations. A printed-edition reconciliation is required. No transit verdict is produced by this bank.
- Daśā results: BPHS 48.8 requires natal and period-inception conditions plus strength; an active lord alone is insufficient.
- Marriage timing: Praśna Mārga 20.1 question/natal applicability and the complete seventh-house, Venus, aspect, D9 and timing prerequisites remain unqualified.

These three are explicit unresolved records, not counted among the 38 implemented rules. This change completes the bounded V1 factor bank; it does not complete or approve every possible Jyotisha interpretation or the wider public personalised service.

## Reproducible checks

Run `node scripts/validate-wss-source-bound-rule-bank.mjs` and `node tests/wss05-source-bound-rule-bank.mjs`. The suite tests 168 dignity/aspect sign predicates, a positive complete Navāṁśa chain, missing D9 and Moon cases, Lagna withholding, cross-birth audit rejection, duplicate grahas and EN/HI output. Existing audited view and legacy evidence tests are retained. The audited-view workflow adds private browser rendering and source-link checks.

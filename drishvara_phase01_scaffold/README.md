# Drishvara – Phase 01 Scaffold

This is a fresh, modular Phase 01 starter structure for Drishvara.

## What is included
- orchestrator skeleton
- six agent stubs
- shared schemas
- lightweight validation helpers
- file-based run logging
- sample input + end-to-end dry-run pipeline
- Markdown + HTML final output generation

## Run locally
```bash
cd drishvara_phase01_scaffold
node scripts/dev-run.js
```

## What the dry run does
The pipeline currently performs a deterministic mock run across these stages:
1. input normalization
2. story drafting
3. visual planning
4. integration
5. guard review
6. publishing

Outputs are written under:
```text
content/outputs/YYYY-MM-DD/topic-slug/
```

## Recommended next build sequence
1. replace deterministic agent stubs with actual LLM/provider calls
2. strengthen schema validation
3. add retry/fallback logic per agent
4. add UI/admin layer
5. connect publishing targets

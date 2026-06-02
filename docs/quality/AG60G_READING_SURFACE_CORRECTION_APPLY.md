# AG60G — Reading Surface Hierarchy Correction Apply

AG60G applies the source-backed Reading Surface correction.

## Corrected hierarchy

- Featured Reads: curated editorial surface; falls back to `data/article-index.json` `publicLatest`.
- Today’s Reading Guide: guided route; falls back to `publicLatest`.
- Indexed Reads: latest public article-index feed.
- Browse by Date: connected to `publicByDate` and `publicTopics`.
- AG09C single Featured Read: hidden as duplicate while marker is preserved.

No Supabase/Auth/backend/runtime database/V02 activation is performed.

## Next

AG60H — Methodology-Gated Module Audit.

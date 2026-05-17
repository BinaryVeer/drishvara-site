# Source Tree Active Register

Status: Housekeeping / source-of-truth separation  
Purpose: Identify active folders, controlled governance folders, production-intelligence folders, and local/archive folders to avoid false references in future audits.

## Active public/site files and folders

These are treated as active public/static site files:

- index.html
- article.html
- insights.html
- about.html
- login.html
- submissions.html
- admin.html
- articles/
- assets/
- package.json
- package-lock.json
- vercel.json

## Active governance and data folders

These are tracked and used for governance, audit records, quality records and editorial source-of-truth files:

- data/
- docs/
- scripts/

## Active automation / future backend folders

These are active but must remain under no-go controls unless explicitly enabled in a future approved stage:

- api/
- services/
- supabase/
- specs/

## Production-intelligence folders

These may contain valuable generation memory and must be reviewed under AG06 before any deletion or restructuring:

- drishvara_phase01_scaffold/
- generated/

## Local quarantine / excluded folders

These should not be scanned for public article counts, reference counts, live-readiness audits, or public publishing inventory:

- _local_archive/
- archive/
- review-bundles/
- backup HTML files
- backup JavaScript files
- old generated review images

## Scan Rules

Public page/article scans should include:

- index.html
- article.html
- insights.html
- articles/

Content-intelligence scans may include:

- drishvara_phase01_scaffold/
- generated/
- data/
- docs/
- scripts/

Public scans must exclude:

- _local_archive/
- archive/
- review-bundles/
- node_modules/
- .git/
- backup files

## Next Step

After this register is committed, AG06A should perform the Full Source-of-Truth Inventory Audit using this register as the scan boundary.

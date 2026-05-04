# R03 — Backup / Archive / Repo Cleanliness Policy

Status: Review/Governance only  
Phase: R-Review  
Depends on: M00 through M10, R00, R01, R02  
Runtime impact: None  
Subscriber impact: None  
Public API impact: None  

## 1. Purpose

R03 defines Drishvara’s backup, archive, and repository cleanliness policy.

R03 does not delete files, move files, alter website behavior, modify runtime code, activate Auth, Supabase, payment, external API fetch, public Panchang output, subscriber guidance, dashboard cards, premium guidance, internal preview runtime, or automatic database mutation.

R03 exists because the working tree contains multiple backup files, archive folders, generated image files, and historical experiment artifacts. These should be handled through a controlled policy before implementation planning begins.

## 2. Core Policy

Backup and archive artifacts must not be deleted casually.

They must be classified first.

After classification, each artifact may be:

- retained;
- moved to archive;
- ignored through .gitignore;
- compressed outside the repository;
- deleted only after explicit approval;
- converted into a documented reference asset;
- left untouched until later review.

R03 only defines policy. It does not perform cleanup.

## 3. Explicit Exclusions

R03 does not implement cleanup, deletion, file movement, .gitignore changes, compression, archival transfer, runtime code change, website UI change, API route, Auth, Supabase, payment, external API fetch, subscriber output, public output, live calculation, geocoding, background jobs, dashboard cards, or automatic activation.

R03 does not commit backup files.

R03 does not remove backup files.

R03 does not decide final deletion.

## 4. Artifact Classes

R03 recognises the following artifact classes:

- html_backup_file;
- js_backup_file;
- index_backup_file;
- image_generation_artifact;
- archive_folder;
- hero_asset_folder;
- temporary_patch_file;
- generated_review_artifact;
- methodology_artifact;
- production_runtime_file;
- unknown_untracked_file.

Each artifact class must have a handling policy before cleanup.

## 5. Backup File Policy

Backup files include patterns such as:

- index.backup-*.html;
- index.html.backup-*;
- assets/js/*.backup-*;
- other timestamped backup files.

Backup files should not be mixed with active production files.

Recommended future handling:

- confirm whether the backup is still needed;
- retain the latest relevant backup only if useful;
- move older backups to archive or external storage;
- add backup patterns to .gitignore if backups are generated repeatedly;
- delete only after explicit approval.

R03 does not perform any of these actions.

## 6. Archive Folder Policy

The archive folder may contain historical materials, rejected experiments, or earlier patch states.

Future cleanup must decide:

- whether archive is needed inside repo;
- whether archive should be compressed;
- whether archive should be moved outside repo;
- whether selected contents should be documented;
- whether old experiments should be deleted.

R03 does not inspect or modify the archive folder.

## 7. Asset Folder Policy

Generated or experimental assets must be classified.

Examples:

- assets/hero/;
- generated images under data/;
- temporary design assets;
- visual experiments.

Future policy should decide whether each asset is:

- active production asset;
- future reference asset;
- archived experiment;
- removable temporary artifact;
- source material requiring credit or provenance note.

R03 does not move or delete assets.

## 8. Git Ignore Policy

A future cleanup step may update .gitignore.

Possible ignore patterns:

- index.backup-*.html;
- index.html.backup-*;
- *.backup-*;
- assets/js/*.backup-*;
- data/ChatGPT Image*.png;
- archive/ if the team decides archive should remain local-only.

R03 does not modify .gitignore.

## 9. Production File Protection Doctrine

R03 must not affect production files.

Protected production files include:

- index.html;
- active CSS files;
- active JavaScript files;
- active assets used by the live site;
- package.json;
- package-lock.json where present;
- methodology/review documents and registries;
- validation scripts.

A cleanup step must never remove production files without separate review.

## 10. Methodology Artifact Protection Doctrine

All M00 through M10 and R00 through R03 artifacts are protected.

Protected methodology/review artifacts include:

- docs/methodology/;
- data/methodology/;
- docs/review/;
- data/review/;
- scripts/validate-*.mjs;
- package.json validation scripts.

These must not be deleted as part of backup cleanup.

## 11. Cleanup Decision Status

Each future cleanup item should use one of these statuses:

- unreviewed;
- retain;
- archive_inside_repo;
- archive_outside_repo;
- add_to_gitignore;
- delete_after_approval;
- convert_to_reference_asset;
- production_file_do_not_touch;
- methodology_artifact_do_not_touch;
- needs_human_review.

## 12. Cleanup Register Doctrine

A future cleanup register should include:

- item_id;
- path;
- artifact_class;
- current_git_status;
- size_if_known;
- last_modified_if_known;
- suspected_origin;
- risk_level;
- proposed_action;
- approval_required;
- reviewer_note;
- final_status.

R03 does not create item-level cleanup records. It defines the register structure.

## 13. Risk Doctrine

Cleanup decisions must consider risk.

Risk levels:

- low;
- medium;
- high;
- critical;
- unknown.

High-risk and critical files require explicit review.

Production files, methodology artifacts, and active assets are high-risk by default.

## 14. Recommended R03 Outcome

R03 recommends that the next implementation phase should begin only after the team is aware that the repo contains backup and archive artifacts.

However, backup cleanup is not mandatory before I00.

I00 may proceed with a clean policy boundary:

- do not touch existing backup files;
- do not rely on backup files as production source;
- do not commit new backup files;
- use controlled cleanup later if needed.

## 15. Future Optional Cleanup Step

If needed, a future cleanup step may be:

C00 — Repository Cleanup Execution Plan

C00 should only be created if actual movement, ignore rules, or deletion is required.

C00 must ask for explicit approval before deletion.

## 16. Safety Doctrine

R03 must preserve all safety gates established across M00 through M10 and R00 through R02.

R03 must not weaken:

- source-first discipline;
- Sanskrit integrity;
- no-invented-mantra doctrine;
- consent-first methodology;
- privacy redaction;
- non-deterministic guidance framing;
- conflict preservation;
- human-review requirements;
- activation readiness gates;
- runtime-disabled posture.

## 17. R03 Acceptance Criteria

R03 is complete when:

1. R03 document exists.
2. R03 registry exists.
3. R03 validator exists.
4. Backup file policy is documented.
5. Archive folder policy is documented.
6. Asset folder policy is documented.
7. Git ignore policy is documented without modifying .gitignore.
8. Production file protection doctrine is documented.
9. Methodology artifact protection doctrine is documented.
10. Cleanup decision statuses are documented.
11. Cleanup register structure is documented.
12. Runtime and public-output flags remain disabled.
13. validate:r03 passes.
14. validate:methodology passes.

## 18. R03 Status

R03 establishes backup, archive, and repo cleanliness policy.

R03 does not perform cleanup or activate runtime.

# AG06F — Long-Form Production Queue / Content Packet Upgrade Mapping

## Purpose

AG06F converts the AG06D public article classification and AG06E long-form article standard into a future production queue. It also maps each current public article upgrade candidate against available scaffold-output candidates recorded by AG06C.

AG06F is governance-only and queue/mapping-only. It does not edit public articles, change references, move scaffold files, copy scaffold files, delete scaffold files, publish content, or activate backend/Auth/Supabase/API/subscriber functionality.

## Inputs

AG06F consumes:

- AG06D public article classification register.
- AG06E long-form article standard.
- AG06C scaffold output preservation register.

## Queue Logic

Each AG06D public article classification row becomes one AG06F upgrade queue item. The queue item records:

- source article path;
- category and detected title;
- current word-count estimate;
- reference-governance status;
- visual-enrichment gap;
- AG06E target standard;
- required upgrade work;
- scaffold candidate mapping;
- publish-readiness status;
- mutation-control flags.

## Scaffold Mapping Logic

AG06F performs a non-mutating token-overlap mapping between public article metadata and scaffold run metadata. Where a direct token match is not available, AG06F assigns candidates from the general long-form scaffold pool only as learning/reference candidates. This is not a publication decision and does not import scaffold files.

## Publish-Readiness Position

Every AG06F queue item remains not publish-ready. Future publication consideration requires a separate content-packet upgrade, reference review, visual/data review, quality review, visitor-value review, and explicit publish-readiness decision under later governance stages.

## Explicit Exclusions

AG06F does not:

- mutate current public article HTML;
- alter AG03/AG05 reference blocks or URLs;
- copy, move, delete, import, or publish scaffold files;
- modify CSS or JavaScript;
- activate backend, API, Auth, Supabase, subscriber output, admin output, payment, login, signup, or public dynamic output;
- mark any existing public article as final Drishvara-quality content.

## Acceptance Criteria

AG06F is acceptable only if:

- the queue contains exactly the AG06D classified public article count;
- every queue entry remains publish_ready=false;
- high/medium priority counts reconcile with AG06D logic;
- scaffold candidates are only mapped, never copied/moved/deleted/imported;
- AG06E word-count, reference, visual, quality, and visitor-value gates are carried forward;
- package scripts for generate:ag06f and validate:ag06f are present;
- validate:project includes validate:ag06f;
- no public article/reference/scaffold/CSS/JS/backend/Auth/Supabase/publishing mutation is performed.

## Next Stage

The recommended next stage is AG06G — Long-Form Content Packet Upgrade Dry-Run Review. AG06G may review the queue and select a controlled first batch for content-packet upgrade planning, but it must remain non-mutating unless separately approved.

# AG07P — One-Article Controlled Apply

## Purpose

AG07P performs one controlled static article apply on the explicitly approved target article:

`articles/policy/when-implementation-tells-the-real-story.html`

This stage creates a pre-apply backup and mutates only the approved target article file.

## Target Article

- Target: `articles/policy/when-implementation-tells-the-real-story.html`
- Backup: `archive/ag07p-backups/when-implementation-tells-the-real-story-before-ag07p.html`
- Scope: one article only.

## What AG07P Performed

AG07P performed:

- pre-apply backup creation;
- one target article file mutation;
- insertion of one AG07P controlled editorial section;
- post-apply audit preparation;
- validation artifact generation.

## What AG07P Did Not Perform

AG07P did not perform:

- multi-article mutation;
- production JSONL append;
- database write;
- Supabase write;
- backend activation;
- Auth activation;
- API route creation;
- publishing approval;
- reference URL population;
- reference insertion;
- visual generation;
- image insertion;
- scaffold import.

## Marker

The target article contains the controlled apply marker:

`<!-- AG07P-CONTROLLED-APPLY-START -->`

and closes with:

`<!-- AG07P-CONTROLLED-APPLY-END -->`

## Audit Requirement

AG07Q must audit:

- target article exists;
- backup exists;
- only one article contains AG07P marker;
- target contains exactly one start marker and one end marker;
- backup does not contain AG07P marker;
- no backend/Auth/Supabase/database/JSONL/publishing activation occurred.

## Next Stage

The next possible stage is AG07Q — Post-Mutation Audit.

AG07Q requires explicit approval.

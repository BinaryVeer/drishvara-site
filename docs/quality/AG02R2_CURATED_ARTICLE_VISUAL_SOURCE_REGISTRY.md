# AG02R2 — Curated Article Visual Source Registry

Status: Audit/registry-only visual source curation stage  
Phase: Article Governance / Image Source-of-Truth  
Depends on: AG02R1, AG02, AG01R1, AG01, AV02, AR02F, AR02C, AR01  
Mutation impact: None  
Article HTML impact: None  
Backend impact: None  
Supabase impact: None  
Auth impact: None  
API impact: None  
Deployment impact: None  

## Purpose

AG02R2 creates a curated article visual source registry without mutating article pages.

AG02 repaired broken/logo article visuals using controlled category fallback visuals. AG02R1 confirmed that homepage article-card visuals cannot be automatically used because the homepage does not expose static article hrefs matching AG02 targets.

Therefore, AG02R2 prepares a source-of-truth registry of candidate article images from existing local assets only. It does not randomly apply images.

## Scope

AG02R2 will:

1. read AG01R1 and AG02 outputs;
2. identify AG02-targeted article pages still using category fallback visuals;
3. scan existing local image assets;
4. exclude favicon/logo/brand/default category fallback assets;
5. rank candidate images against article title, slug and category;
6. create a curated registry with pending candidate mappings;
7. keep all selections pending editorial review;
8. avoid article HTML mutation;
9. avoid reference mutation;
10. avoid external fetching.

## Source-of-Truth Rule

AG02R2 creates only a registry. No candidate image becomes public unless a later approved apply stage uses it.

## Explicit Exclusions

AG02R2 does not:

- change article HTML;
- change article text;
- expand or reduce article word count;
- change reference URLs;
- insert reference links;
- replace article images;
- fetch external images;
- create API routes;
- activate backend;
- activate Supabase;
- activate Auth;
- deploy;
- delete files;
- move files.

## Acceptance Criteria

AG02R2 is complete when:

1. AG02R2 document exists.
2. AG02R2 registry exists.
3. AG02R2 generator exists.
4. AG02R2 validator exists.
5. Curated visual registry output exists.
6. Preview output exists.
7. AG02-targeted article count is preserved.
8. Candidate image inventory is recorded.
9. Each AG02-targeted article has a pending visual review entry.
10. No article image is applied.
11. No reference URL is changed.
12. Article text/word-count logic is not changed.
13. Backend/API/Supabase/Auth activation remains no-go.

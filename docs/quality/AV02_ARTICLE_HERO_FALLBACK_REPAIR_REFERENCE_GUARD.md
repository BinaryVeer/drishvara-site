# AV02 — Article Hero Fallback Repair, Brand-Mark Restoration and Reference/Credit Guard

Status: Article UI repair patch  
Phase: Article UI / Long-form Reading Experience  
Depends on: AV01, AR02F, AR02C, AR01  

## Purpose

AV02 repairs the issues observed after AV01:

1. category fallback SVGs must render correctly;
2. small Drishvara article brand marks must not be replaced by large category visuals;
3. article hero fallback visuals must remain broad and valid;
4. article reading width must remain broad and justified;
5. routed article pages must show a reference/image-credit guard if the loaded article has no visible reference block.

## Scope

AV02 will:

- regenerate valid category fallback SVG assets;
- restore false-positive AV01 fallback replacements before the article title back to small brand marks;
- keep broad justified article reading layout;
- preserve AR02C/AR02F verified reference links;
- add a route-level reference/image-credit guard to `article.html`;
- avoid changing article text or word count.

## Explicit Exclusions

AV02 does not change article text, reduce word count, change accepted reference URLs, insert new verified links, activate backend, activate Supabase, activate Auth, deploy, delete, or move files.

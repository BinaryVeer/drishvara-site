# AR02D — Sample Reference Link Manual Live Review Checklist

Status: Manual live review checklist  
Phase: Article Quality / Verified Reference Publication Review  
Depends on: AR02C, AR02B, AR02A, AR01  
Mutation impact: None  
Article HTML impact: None  
Backend impact: None  
Supabase impact: None  
Auth impact: None  
API impact: None  
Deployment impact: None  

## Purpose

AR02D creates a manual live-review checklist for the five AR02C sample article pages.

AR02C inserted accepted references into five sample articles. Before scaling reference insertion to the remaining articles, the live site must be reviewed for page rendering, reference section visibility, link click behaviour, image-credit visibility, and navigation stability.

## Scope

AR02D will:

1. read the AR02B sample reference registry;
2. read the AR02C insertion preview;
3. create a manual live-review checklist for the five sample article pages;
4. include the expected public URL for each article;
5. include the two inserted reference URLs for each article;
6. keep all live-review observations as pending;
7. keep article HTML unchanged.

## Manual Review Checks

Each sample page should be checked for:

- page opens successfully;
- header/navigation remains visible;
- reference section appears correctly;
- exactly two reference links appear;
- both reference links open in a new tab;
- image credit / attribution is visible;
- no dropdown freeze or page sticking;
- no obvious layout break on desktop;
- no obvious layout break on mobile;
- no console error that blocks user interaction.

## Explicit Exclusions

AR02D does not:

- mutate article HTML;
- insert new references;
- fetch external links automatically;
- mark the live review as passed;
- create API routes;
- connect Supabase;
- activate Auth;
- collect user data;
- deploy frontend;
- deploy backend;
- delete or move files.

## Acceptance Criteria

AR02D is complete when:

1. AR02D document exists.
2. AR02D registry exists.
3. AR02D generator exists.
4. AR02D validator exists.
5. Manual live-review checklist exists.
6. Preview exists.
7. Exactly five sample article review entries are present.
8. Each review entry has two expected reference URLs.
9. All live-review observations remain pending.
10. Article HTML mutation remains disabled.
11. Backend/API/Supabase/Auth activation remains no-go.

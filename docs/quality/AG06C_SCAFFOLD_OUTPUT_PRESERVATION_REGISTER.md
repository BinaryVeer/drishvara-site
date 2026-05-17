# AG06C — Scaffold Output Preservation Register

Status: Preservation-register stage  
Phase: Content Intelligence Foundation  
Depends on: AG06B, AG06A, SOURCE_TREE_ACTIVE_REGISTER  
Mutation impact: Content-intelligence registry only  
Public article HTML impact: None  
CSS impact: None  
JavaScript impact: None  
Backend impact: None  
Supabase impact: None  
Auth impact: None  
Deployment impact: None  

## Purpose

AG06C preserves the existing scaffold pipeline outputs as structured content-intelligence registry entries.

AG06A confirmed that the public article layer is short and weak, while the scaffold layer contains stronger long-form outputs, visual plans and learning snapshots. AG06B created the content-intelligence schema. AG06C now registers the existing scaffold runs so their production intelligence is no longer scattered or at risk of being lost.

## Scope

AG06C will:

1. read AG06B schema manifest;
2. read AG06A source-of-truth audit;
3. scan `drishvara_phase01_scaffold/content/outputs/`;
4. identify scaffold run directories through known artifact markers;
5. record available artifacts for each run;
6. record missing artifacts for each run;
7. estimate final markdown word counts where available;
8. detect visual plan and learning snapshot availability;
9. create a scaffold preservation register;
10. create a compact preview;
11. identify AG06D as the next stage.

## Explicit Exclusions

AG06C does not:

- modify public article HTML;
- modify homepage HTML;
- modify CSS;
- modify JavaScript;
- modify images;
- modify references;
- copy scaffold outputs;
- import scaffold outputs into public articles;
- publish anything;
- activate backend;
- activate Supabase;
- activate Auth;
- deploy;
- delete files;
- move files.

## Acceptance Criteria

AG06C is complete when:

1. AG06C document exists.
2. AG06C registry exists.
3. AG06C generator exists.
4. AG06C validator exists.
5. Scaffold preservation register exists.
6. Preview output exists.
7. AG06B schema manifest is consumed.
8. AG06A scaffold counts are reconciled.
9. Scaffold run entries are recorded.
10. Final markdown/html/visual plan/learning snapshot counts are recorded.
11. Missing artifact summary is recorded.
12. No public article/page/content/image/reference/CSS/JS mutation is performed.
13. Runtime/backend/Supabase/Auth/API activation remains no-go.
14. AG06D Existing Public Article Classification is identified as next.

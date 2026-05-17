# AG06B — Content Intelligence Schema

Status: Schema-definition stage  
Phase: Content Intelligence Foundation  
Depends on: AG06A, SOURCE_TREE_ACTIVE_REGISTER, AG05Z, AG04Z, AG03Z  
Mutation impact: None to public article HTML  
Article HTML impact: None  
CSS impact: None  
JavaScript impact: None  
Backend impact: None  
Supabase impact: None  
Auth impact: None  
Deployment impact: None  

## Purpose

AG06B defines the durable Drishvara Content Intelligence schema.

AG06A confirmed that the current public article layer is short, lacks real visual/infographic depth, has 5 unguided public articles, and does not yet have a durable content-intelligence store. AG06B creates the schema foundation required to preserve future article ideas, briefs, drafts, references, visual plans, quality reviews, learning snapshots and publish decisions.

## Scope

AG06B defines schema files for:

1. content packets;
2. run registry;
3. reference registry;
4. visual registry;
5. quality review records;
6. publish queue records;
7. learning snapshot records;
8. content-intelligence folder structure.

## Explicit Exclusions

AG06B does not:

- modify public article HTML;
- modify homepage HTML;
- modify CSS;
- modify JavaScript;
- modify images;
- modify existing references;
- import scaffold outputs;
- publish articles;
- activate backend;
- activate Supabase;
- activate Auth;
- deploy;
- delete files;
- move files.

## Acceptance Criteria

AG06B is complete when:

1. AG06B document exists.
2. AG06B registry exists.
3. AG06B generator exists.
4. AG06B validator exists.
5. Content-intelligence schema folder exists.
6. Content packet schema is generated.
7. Run registry schema is generated.
8. Reference registry schema is generated.
9. Visual registry schema is generated.
10. Quality review schema is generated.
11. Publish queue schema is generated.
12. Learning snapshot schema is generated.
13. Schema manifest is generated.
14. AG06A findings are consumed.
15. No public article/page/content/image/reference/CSS/JS mutation is performed.
16. Runtime/backend/Supabase/Auth/API activation remains no-go.
17. AG06C Scaffold Output Preservation Register is identified as next.

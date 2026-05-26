# AG28B — Database Table Plan

## Purpose

AG28B defines the planned database table structure for Drishvara.

It plans tables, relationships, IDs, status fields, audit logs, queue structures, publishing records and migration naming conventions. It does not create any database object.

## Planned Table Groups

- Identity and access.
- Content core.
- Admin/Editor workflow.
- References, attribution and objects.
- Publishing and audit.
- Future reader personalization.

## Preserved Governance

- System-generated content goes to Admin first.
- Editor-created article candidates go to Admin review.
- Admin may assign to Editor.
- Editor returns to Admin.
- Only Admin can publish in the future.
- Public readers see only published content.

## Non-Activation Boundary

AG28B does not create Supabase project, Auth, database, tables, migrations, RLS policies, secrets, runtime queues, deployment or publishing.

## Next Stage

AG28C — Auth Flow Plan.

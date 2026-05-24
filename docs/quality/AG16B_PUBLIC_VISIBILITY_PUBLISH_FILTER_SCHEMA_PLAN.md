# AG16B — Public Visibility and Publish Filter Schema Plan

## Purpose

AG16B converts the AG16A public visibility and publish-control doctrine into concrete schema and filter contracts.

AG16B is schema planning only. It does not generate articles, mutate articles, create active Admin Review Queue records, mutate queues or indexes, execute Admin/Editor actions, activate Auth/backend/Supabase, wire GitHub tokens, switch public visibility, mutate public indexes or publish anything.

## Public Exposure Contract

An article may appear on public Drishvara surfaces only when all required public filter conditions pass, including:

- public_visibility === true
- publish_approved === true
- public_index_allowed === true
- status is public_published or published_closed
- article_hash matches approved_hash
- quality, preview and hash checks pass

## Planned Outputs

- Public visibility field schema
- Publish-control field schema
- Public surface filter contract
- Public surface exclusion contract
- Public visibility filter validation plan

## Next Stage

AG16C — Public Visibility and Publish Filter Schema Dry-run — only with explicit approval.

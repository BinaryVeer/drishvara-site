# AG16A — Public Visibility and Publish-Control Preparation

## Purpose

AG16A defines the public visibility and publish-control doctrine after AG15 closure.

AG16A is preparation only. It does not generate articles, mutate articles, create active Admin Review Queue records, mutate queues or indexes, execute Admin/Editor actions, activate Auth/backend/Supabase, wire GitHub tokens, switch public visibility, mutate public indexes or publish anything.

## Core Rule

An article may appear in public Featured Reads or public article indexes only when both conditions are true:

- public_visibility: true
- publish_approved: true

## Planned Controls

- Public visibility state model
- Publish-control state model
- Featured Reads public filter plan
- Archive/internal-intelligence retention plan

## Next Stage

AG16B — Public Visibility and Publish Filter Schema Plan — only with explicit approval.

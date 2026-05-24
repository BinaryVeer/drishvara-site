# AG17D — Non-active Static Go-live Implementation Scaffold

## Purpose

AG17D creates a non-active scaffold for the static/GitHub-controlled first go-live path.

AG17D does not generate articles, mutate articles, create active Admin Review Queue records, mutate queues or indexes, execute Admin/Editor actions, activate Auth/backend/Supabase, wire GitHub tokens, write to GitHub, switch public visibility, mutate public indexes, trigger deployment or publish anything.

## Scaffold Location

`internal-scaffolds/ag17d-non-active-static-go-live`

## Created Scaffold Files

- `internal-scaffolds/ag17d-non-active-static-go-live/static-go-live-helper.non-active.mjs`
- `internal-scaffolds/ag17d-non-active-static-go-live/public-exposure-delta.template.json`
- `internal-scaffolds/ag17d-non-active-static-go-live/github-commit-payload.template.json`
- `internal-scaffolds/ag17d-non-active-static-go-live/deployment-checklist.template.json`
- `internal-scaffolds/ag17d-non-active-static-go-live/publication-state-fixture.approved-and-blocked.json`
- `internal-scaffolds/ag17d-non-active-static-go-live/README.md`

## Supabase/Auth Reminder

Hybrid staged path remains in force: static/GitHub-controlled go-live first; Supabase/Auth/backend later only after explicit reminder, review and approval.

## Next Stage

AG17E — Non-active Static Go-live Implementation Scaffold Audit — only with explicit approval.

# Drishvara Scaffold Staging Plan

## Keep / stage
- .gitignore
- README.md
- package.json
- apps/
- content/ (except generated outputs)
- core/
- docs/
- scripts/

## Do not stage
- .env
- archive/
- node_modules/
- content/outputs/
- unrelated parent-project deletions outside scaffold boundary

## Goal
Create one clean scaffold commit after review, without mixing parent project changes.

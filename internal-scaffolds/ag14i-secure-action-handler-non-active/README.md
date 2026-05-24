# AG14I — Secure Action Handler Non-active Scaffold

This directory is intentionally **not** a live API route.

It is a non-active scaffold for future Admin/Editor action handling. It must not be moved under /api, /functions, /server, or any deployable backend route without a later approved implementation stage.

## Files

- admin-action.non-active.mjs
- admin-action-request.schema.json
- admin-action-response.schema.json
- role-action-allowlist.json

## Hard Boundary

No credentials, passwords, password hashes, Auth activation, backend activation, external data service activation, GitHub write token, queue mutation, article mutation, audit write, public visibility switch, deployment trigger or publishing is performed here.

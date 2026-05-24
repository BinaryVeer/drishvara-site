# AG14G — Secure Action Handler Architecture Plan

## Purpose

AG14G defines the architecture for a future secure Admin/Editor action handler.

AG14G is architecture/planning only. It does not create an action handler, credentials, passwords, password hashes, Auth/backend/Supabase activation, database writes, GitHub write operations, article mutation, queue mutation, public visibility switching, deployment triggers or publishing.

## Recommended Architecture

Hybrid path:

1. GitHub-backed static queue/action-handler architecture first.
2. Supabase/Auth/database migration later after explicit approval.

## Core Requirements

- Server-side action handling.
- Role-based Admin/Editor authentication.
- Environment-only secret storage.
- Role-action allowlist.
- Pre-action hash validation.
- Audit write before state transition.
- Post-action hash capture.
- Versioning and rollback readiness.
- No browser-exposed GitHub token or Supabase service key.

## Next Stage

AG14H — Secure Action Handler Architecture Audit and Implementation Readiness — only with explicit approval.

# AG14D — Public Sign-in and Internal Admin Route Separation Apply

## Purpose

AG14D applies the product route-separation decision.

## Applied Decision

- Public visitor/member route: /signin.html
- Internal Admin/Editor route: /admin.html

## Created / Updated

- Created or restored signin.html as the public Sign in / Join preview page.
- Preserved admin.html as the internal Admin/Editor scaffold.
- Updated public HTML navigation links away from internal Admin/Editor routes where detected.

## Scope Boundary

AG14D does not create real credentials, hardcoded passwords, password hashes, Auth/backend/Supabase activation, article publishing or public visibility switching.

## Next Stage

AG14E — Admin Editor Decision and Submission Workflow Model — only with explicit approval.

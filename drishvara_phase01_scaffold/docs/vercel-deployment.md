# Drishvara Vercel Deployment Notes

## Recommended root
Set the Vercel project **Root Directory** to:

drishvara_phase01_scaffold

## Recommended environment variables
Add these in Vercel Project Settings → Environment Variables:

- OPENAI_API_KEY
- OPENAI_MODEL
- DRISHVARA_RUN_MODE
- DRISHVARA_DEBUG_MODE
- DRISHVARA_PROVIDER_STAGES
- NODE_ENV
- DRISHVARA_ENV
- DRISHVARA_OUTPUT_ROOT
- DRISHVARA_PUBLISH_ENABLED
- DRISHVARA_LOG_LEVEL

## Recommended production defaults
- DRISHVARA_RUN_MODE=full
- DRISHVARA_DEBUG_MODE=0
- DRISHVARA_PROVIDER_STAGES=
- NODE_ENV=production
- DRISHVARA_ENV=production
- DRISHVARA_OUTPUT_ROOT=content/outputs
- DRISHVARA_PUBLISH_ENABLED=1
- DRISHVARA_LOG_LEVEL=info

## Pre-deploy checks
Run these locally before deployment:

- ./scripts/ready.sh
- python scripts/run_profile.py cheap-smoke
- python scripts/run_profile.py mixed-core

## Important note
This scaffold is pipeline-oriented, not just a static site.
If you keep the public website at the parent repo root, do not accidentally point that site deployment to the scaffold unless that is your intentional migration plan.

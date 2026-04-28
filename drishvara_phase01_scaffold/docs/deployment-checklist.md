# Drishvara Deployment Checklist

## 1. Environment
- [ ] Create real production `.env` from `.env.production.example`
- [ ] Set valid `OPENAI_API_KEY`
- [ ] Confirm `OPENAI_MODEL`
- [ ] Ensure `DRISHVARA_DEBUG_MODE=0`
- [ ] Ensure `DRISHVARA_RUN_MODE=full` for live execution

## 2. Safety / controls
- [ ] Confirm no forced debug hooks are enabled
- [ ] Confirm `./scripts/ready.sh` returns READY
- [ ] Confirm latest run summary exists
- [ ] Confirm intended run profile is present in `config/run-profiles.json`

## 3. Dry run before live
- [ ] Run `python scripts/run_profile.py cheap-smoke`
- [ ] Run `python scripts/run_profile.py mixed-core`
- [ ] Run `python scripts/run_profile.py production-full`

## 4. Deployment
- [ ] Confirm hosting target
- [ ] Confirm environment variables are added to hosting platform
- [ ] Confirm maintenance mode decision (on/off)
- [ ] Confirm publish/output path behavior
- [ ] Confirm logs are accessible after deployment

## 5. Post-deployment verification
- [ ] Check latest output directory is created
- [ ] Check `00_run_summary.json` is written
- [ ] Check run status is pass
- [ ] Check no debug override text appears in logs

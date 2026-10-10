#!/usr/bin/env bash

# Vercel Ignored Build Step helper for Drishvara governance-only JSON commits.
# Exit 0 means "ignore/skip build"; exit 1 means "run build".

set -u

log() {
  printf 'drishvara-vercel-ignore: %s\n' "$*"
}

build() {
  log "build: $*"
  exit 1
}

skip() {
  log "skip: $*"
  exit 0
}

is_allowed_path() {
  case "$1" in
    "data/knowledge-base/panchang-festival/production/ag74q-r1-observance-expansion-schema-proposal.json" | \
    "data/knowledge-base/panchang-festival/production/fixed-date-civil-national-international-source-register.json" | \
    "data/knowledge-base/panchang-festival/production/named-hindu-festival-rule-source-research-matrix.json" | \
    "data/knowledge-base/panchang-festival/production/named-hindu-festival-source-rule-evidence-r1.json" | \
    "data/knowledge-base/panchang-festival/production/named-hindu-festival-rule-conflict-register-r1.json" | \
    "data/knowledge-base/panchang-festival/production/hrc-01-diwali-lakshmi-puja-identity-resolution-r1.json")
      return 0
      ;;
    *)
      return 1
      ;;
  esac
}

command -v git >/dev/null 2>&1 || build "git is unavailable"

inside_work_tree="$(git rev-parse --is-inside-work-tree 2>/dev/null)" || build "not inside a git work tree"
[ "$inside_work_tree" = "true" ] || build "not inside a git work tree"

head_sha="${VERCEL_GIT_COMMIT_SHA:-}"
if [ -z "$head_sha" ]; then
  head_sha="$(git rev-parse HEAD 2>/dev/null)" || build "unable to resolve current HEAD"
  log "using local HEAD as current revision"
else
  log "using VERCEL_GIT_COMMIT_SHA as current revision"
fi

git cat-file -e "$head_sha^{commit}" 2>/dev/null || build "current revision is unavailable in local clone: $head_sha"

base_sha=""
base_source=""

if [ -n "${DRISHVARA_PREVIOUS_PRODUCTION_SHA:-}" ]; then
  base_sha="$DRISHVARA_PREVIOUS_PRODUCTION_SHA"
  base_source="DRISHVARA_PREVIOUS_PRODUCTION_SHA"
elif [ -n "${DRISHVARA_VERCEL_PREVIOUS_DEPLOYED_SHA:-}" ]; then
  base_sha="$DRISHVARA_VERCEL_PREVIOUS_DEPLOYED_SHA"
  base_source="DRISHVARA_VERCEL_PREVIOUS_DEPLOYED_SHA"
elif [ "${DRISHVARA_TRUST_VERCEL_GIT_PREVIOUS_SHA:-}" = "1" ] && [ -n "${VERCEL_GIT_PREVIOUS_SHA:-}" ]; then
  base_sha="$VERCEL_GIT_PREVIOUS_SHA"
  base_source="VERCEL_GIT_PREVIOUS_SHA with DRISHVARA_TRUST_VERCEL_GIT_PREVIOUS_SHA=1"
fi

[ -n "$base_sha" ] || build "no verified previous production deployment SHA was provided"

log "using $base_source as comparison base"

git cat-file -e "$base_sha^{commit}" 2>/dev/null || build "comparison base is unavailable in shallow clone: $base_sha"
git merge-base --is-ancestor "$base_sha" "$head_sha" 2>/dev/null || build "comparison base is not an ancestor of current revision"

diff_output="$(git diff --name-status --find-renames=90% "$base_sha" "$head_sha" -- 2>&1)"
diff_status=$?
[ "$diff_status" -eq 0 ] || build "git diff failed: $diff_output"
[ -n "$diff_output" ] || build "empty diff between comparison base and current revision"

while IFS=$'\t' read -r status path extra; do
  [ -n "$status" ] || continue

  case "$status" in
    A|M)
      ;;
    *)
      if [ -n "${extra:-}" ]; then
        build "non-add/modify change detected: $status $path -> $extra"
      fi
      build "non-add/modify change detected: $status $path"
      ;;
  esac

  if ! is_allowed_path "$path"; then
    build "changed path is outside governance-only allowlist: $path"
  fi
done <<EOF
$diff_output
EOF

skip "all changes since verified production base are exact allowlisted governance JSON additions/modifications"

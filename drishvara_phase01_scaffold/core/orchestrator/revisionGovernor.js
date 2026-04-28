export function decideRevisionAction({ guardReport, revisionCount, maxRevisions = 3 }) {
  const status = guardReport?.status;

  if (status === 'pass') {
    return { action: 'publish', reason: 'guard_pass' };
  }

  if (status === 'reject') {
    return { action: 'reject', reason: 'guard_reject' };
  }

  if (status === 'revise' && revisionCount < maxRevisions) {
    return { action: 'revise', reason: 'guard_revise' };
  }

  if (status === 'revise' && revisionCount >= maxRevisions) {
    return { action: 'drop', reason: 'max_revisions_reached' };
  }

  return { action: 'drop', reason: 'unknown_guard_status' };
}

function envTrue(name) {
  return ['1', 'true', 'yes', 'on'].includes(
    String(process.env[name] || '').toLowerCase()
  );
}

export function isDebugModeEnabled() {
  return envTrue('DRISHVARA_DEBUG_MODE');
}

export function isForcedHookEnabled(hookName) {
  if (!isDebugModeEnabled()) return false;
  return envTrue(hookName);
}

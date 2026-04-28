function parseCsv(value = '') {
  return String(value || '')
    .split(',')
    .map(x => x.trim())
    .filter(Boolean);
}

export function resolveStageExecutionMode(stageName = '') {
  const runMode = String(process.env.DRISHVARA_RUN_MODE || 'full').toLowerCase();
  const allowedStages = new Set(parseCsv(process.env.DRISHVARA_PROVIDER_STAGES || ''));

  if (runMode === 'off') {
    return {
      useProvider: false,
      runMode,
      reason: 'provider disabled globally'
    };
  }

  if (runMode === 'cheap') {
    return {
      useProvider: false,
      runMode,
      reason: 'cheap mode uses fallback/stub for all stages'
    };
  }

  if (runMode === 'mixed') {
    if (allowedStages.has(stageName)) {
      return {
        useProvider: true,
        runMode,
        reason: `mixed mode enabled for stage: ${stageName}`
      };
    }

    return {
      useProvider: false,
      runMode,
      reason: `mixed mode fallback for stage: ${stageName}`
    };
  }

  return {
    useProvider: true,
    runMode,
    reason: 'full mode uses provider for all stages'
  };
}

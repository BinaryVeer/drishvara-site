import fs from 'node:fs';
import path from 'node:path';

function nowIso() {
  return new Date().toISOString();
}

function csvToArray(value = '') {
  return String(value || '')
    .split(',')
    .map(x => x.trim())
    .filter(Boolean);
}

export function buildRunSummary({
  topic = '',
  outputDir = '',
  finalStatus = 'unknown',
  revisionCount = 0,
  guardStatus = null,
  returnToStage = null
}) {
  return {
    generatedAt: nowIso(),
    topic,
    outputDir,
    finalStatus,
    revisionCount,
    guardStatus,
    returnToStage,
    runMode: String(process.env.DRISHVARA_RUN_MODE || 'full').toLowerCase(),
    debugMode: ['1', 'true', 'yes', 'on'].includes(
      String(process.env.DRISHVARA_DEBUG_MODE || '').toLowerCase()
    ),
    providerStages: csvToArray(process.env.DRISHVARA_PROVIDER_STAGES || ''),
  };
}

export function writeRunSummary(outputDir, summary) {
  const filePath = path.join(outputDir, '00_run_summary.json');
  fs.writeFileSync(filePath, JSON.stringify(summary, null, 2), 'utf8');
  return filePath;
}

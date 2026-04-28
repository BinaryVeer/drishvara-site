import { runPipeline } from '../core/orchestrator/runPipeline.js';

function getArgValue(flag) {
  const index = process.argv.indexOf(flag);
  if (index === -1) return null;
  return process.argv[index + 1] || null;
}

const inputPath = getArgValue('--input');

const result = await runPipeline(
  inputPath
    ? { inputPath }
    : {}
);

console.log('\nRun completed successfully.');
console.log(`Output directory: ${result.outputDir}`);
console.log(`Log file: ${result.logPath}`);

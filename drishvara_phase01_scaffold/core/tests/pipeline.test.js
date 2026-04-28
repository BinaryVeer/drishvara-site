import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runPipeline } from '../orchestrator/runPipeline.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '../..');

const result = await runPipeline({
  inputPath: path.join(projectRoot, 'core/tests/sample-inputs/sample-topic.json')
});

if (!result?.publishBundle?.title) {
  throw new Error('Pipeline test failed: publish bundle title missing.');
}

console.log('Pipeline test passed.');

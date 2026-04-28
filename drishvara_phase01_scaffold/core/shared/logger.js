import path from 'node:path';
import { ensureDir, writeText } from './fileUtils.js';

export function createLogger(logDir) {
  ensureDir(logDir);
  const lines = [];

  function log(message) {
    const line = `[${new Date().toISOString()}] ${message}`;
    lines.push(line);
    console.log(line);
  }

  function flush() {
    const logPath = path.join(logDir, 'run.log');
    writeText(logPath, lines.join('\n'));
    return logPath;
  }

  return { log, flush };
}

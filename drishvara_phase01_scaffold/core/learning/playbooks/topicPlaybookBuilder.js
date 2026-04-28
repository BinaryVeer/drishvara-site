import fs from 'node:fs';
import path from 'node:path';

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function readJsonl(filePath) {
  if (!fs.existsSync(filePath)) return [];
  return fs.readFileSync(filePath, 'utf8')
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => {
      try {
        return JSON.parse(line);
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

function topicKeyFromSummary(summary) {
  return [
    `contentType:${String(summary.contentType || '').toLowerCase()}`,
    `audience:${String(summary.audience || '').toLowerCase()}`
  ].join('||');
}

export function buildTopicPlaybooks({ projectRoot }) {
  const learningRoot = path.join(projectRoot, 'core', 'learning');
  const runLedgerFile = path.join(learningRoot, 'run-ledger', 'runs.jsonl');
  const playbookDir = path.join(learningRoot, 'playbooks');

  ensureDir(playbookDir);

  const runs = readJsonl(runLedgerFile);
  const passRuns = runs.filter(r => r.finalStatus === 'pass');

  const grouped = new Map();

  for (const run of passRuns) {
    const key = topicKeyFromSummary(run);

    if (!grouped.has(key)) {
      grouped.set(key, {
        key,
        contentType: run.contentType || '',
        audience: run.audience || '',
        successfulTopics: [],
        evidenceCount: 0,
        firstSeen: run.timestamp || null,
        lastSeen: run.timestamp || null
      });
    }

    const bucket = grouped.get(key);
    bucket.evidenceCount += 1;

    if (run.topic && !bucket.successfulTopics.includes(run.topic)) {
      bucket.successfulTopics.push(run.topic);
    }

    if (run.timestamp && (!bucket.firstSeen || run.timestamp < bucket.firstSeen)) {
      bucket.firstSeen = run.timestamp;
    }
    if (run.timestamp && (!bucket.lastSeen || run.timestamp > bucket.lastSeen)) {
      bucket.lastSeen = run.timestamp;
    }
  }

  const playbooks = [...grouped.values()].map(bucket => ({
    ...bucket,
    guidance: [
      `This contentType/audience combination has ${bucket.evidenceCount} successful pass run(s).`,
      'Reuse structures that keep the narrative operational, structured, and easy to review.',
      'Prefer stable section naming and clear problem-to-action flow.'
    ]
  }));

  playbooks.sort((a, b) => b.evidenceCount - a.evidenceCount);

  writeJson(path.join(playbookDir, 'topic-playbooks.json'), {
    generatedAt: new Date().toISOString(),
    totalPlaybooks: playbooks.length,
    items: playbooks
  });

  return {
    totalPlaybooks: playbooks.length
  };
}

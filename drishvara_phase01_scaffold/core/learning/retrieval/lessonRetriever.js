import fs from 'node:fs';
import path from 'node:path';

function readJsonl(filePath) {
  if (!fs.existsSync(filePath)) return [];
  const lines = fs.readFileSync(filePath, 'utf8')
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean);

  return lines.map(line => {
    try {
      return JSON.parse(line);
    } catch {
      return null;
    }
  }).filter(Boolean);
}

function buildProfileKey(input = {}) {
  return [
    `contentType:${String(input.contentType || '').toLowerCase()}`,
    `audience:${String(input.audience || '').toLowerCase()}`
  ].join('||');
}

function buildTags(input = {}) {
  const tags = [];
  if (input.topic) tags.push('topic:' + String(input.topic).toLowerCase());
  if (input.contentType) tags.push('contentType:' + String(input.contentType).toLowerCase());
  if (input.audience) tags.push('audience:' + String(input.audience).toLowerCase());
  tags.push('profile:' + buildProfileKey(input));
  return tags;
}

function keyForLesson(lesson) {
  return [
    lesson.lessonType || '',
    lesson.stage || '',
    lesson.patternCode || '',
    lesson.pattern || '',
    lesson.recommendedAction || ''
  ].join('||');
}

function scoreFromSourceStatuses(lesson) {
  const counts = lesson.sourceStatusCounts || {};
  let score = 0;

  score += (counts.pass || 0) * 3;
  score += (counts.revise || 0) * 1;
  score += (counts.reject || 0) * 0;
  score += (counts.dropped_after_max_revisions || 0) * -1;

  if (lesson.sourceStatus === 'pass') score += 2;
  if (lesson.sourceStatus === 'dropped_after_max_revisions') score -= 1;

  return score;
}

function scoreLesson(lesson, tags, stageName, profileKey) {
  let score = 0;

  if (lesson.stage === stageName) score += 5;
  if (lesson.stage === 'pipeline') score += 1;

  if (lesson.profileKey && lesson.profileKey === profileKey) {
    score += 8;
  }

  const lessonTags = Array.isArray(lesson.tags) ? lesson.tags : [];
  for (const tag of tags) {
    if (lessonTags.includes(tag)) score += 3;
  }

  if (lesson.status === 'validated') score += 6;
  if (lesson.status === 'candidate') score += 1;

  if (typeof lesson.uniqueTopicCount === 'number') score += lesson.uniqueTopicCount;
  if (typeof lesson.uniqueRunCount === 'number') score += Math.min(lesson.uniqueRunCount, 3);
  if (typeof lesson.observationCount === 'number') score += Math.min(lesson.observationCount, 3);

  score += scoreFromSourceStatuses(lesson);

  if (lesson.lessonType === 'success_pattern') score += 1;
  if (lesson.stage === 'pipeline' && stageName !== 'pipeline') score -= 1;

  return score;
}

export function retrieveRelevantLessons({ projectRoot, stageName, input, limit = 5 }) {
  const lessonsRoot = path.join(projectRoot, 'core', 'learning', 'lessons');
  const validated = readJsonl(path.join(lessonsRoot, 'validated-lessons.jsonl')).map(l => ({
    ...l,
    status: 'validated'
  }));
  const candidates = readJsonl(path.join(lessonsRoot, 'candidate-lessons.jsonl')).map(l => ({
    ...l,
    status: l.status || 'candidate'
  }));

  const merged = new Map();

  for (const lesson of [...validated, ...candidates]) {
    const key = keyForLesson(lesson);
    if (!merged.has(key)) {
      merged.set(key, lesson);
      continue;
    }

    const existing = merged.get(key);
    if (existing.status !== 'validated' && lesson.status === 'validated') {
      merged.set(key, lesson);
    }
  }

  const tags = buildTags(input);
  const profileKey = buildProfileKey(input);

  return [...merged.values()]
    .map(lesson => ({
      ...lesson,
      _score: scoreLesson(lesson, tags, stageName, profileKey)
    }))
    .filter(lesson => lesson._score > 0)
    .sort((a, b) => b._score - a._score)
    .slice(0, limit)
    .map(({ _score, ...lesson }) => lesson);
}

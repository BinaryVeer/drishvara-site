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

function writeJsonl(filePath, records) {
  const text = records.map(r => JSON.stringify(r)).join('\n');
  fs.writeFileSync(filePath, text ? text + '\n' : '', 'utf8');
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

function topicTagsFromLesson(lesson) {
  const tags = Array.isArray(lesson.tags) ? lesson.tags : [];
  return tags.filter(tag => String(tag).startsWith('topic:'));
}

function profileTagFromLesson(lesson) {
  const tags = Array.isArray(lesson.tags) ? lesson.tags : [];
  return tags.find(tag => String(tag).startsWith('profile:')) || null;
}

function keyForLesson(lesson) {
  if (lesson.patternCode) {
    return [
      lesson.lessonType || '',
      lesson.stage || '',
      lesson.patternCode || '',
      lesson.profileKey || profileTagFromLesson(lesson) || ''
    ].join('||');
  }

  return [
    lesson.lessonType || '',
    lesson.stage || '',
    lesson.pattern || '',
    lesson.recommendedAction || '',
    lesson.profileKey || profileTagFromLesson(lesson) || ''
  ].join('||');
}

function pushUnique(arr, value, max = 5) {
  if (!value) return;
  if (!arr.includes(value)) arr.push(value);
  if (arr.length > max) arr.splice(max);
}

export function promoteLessons({
  projectRoot,
  validationThreshold = 2,
  policyThreshold = 3,
  policyTopicDiversityThreshold = 2
}) {
  const lessonsDir = path.join(projectRoot, 'core', 'learning', 'lessons');
  const policiesDir = path.join(projectRoot, 'core', 'learning', 'policies');

  ensureDir(lessonsDir);
  ensureDir(policiesDir);

  const candidateFile = path.join(lessonsDir, 'candidate-lessons.jsonl');
  const validatedFile = path.join(lessonsDir, 'validated-lessons.jsonl');
  const policyFile = path.join(policiesDir, 'prompt-policies.json');

  const candidateLessons = readJsonl(candidateFile);
  const grouped = new Map();

  for (const lesson of candidateLessons) {
    const key = keyForLesson(lesson);

    if (!grouped.has(key)) {
      grouped.set(key, {
        lessonType: lesson.lessonType,
        stage: lesson.stage,
        patternCode: lesson.patternCode || null,
        patternLabel: lesson.patternLabel || null,
        profileKey: lesson.profileKey || profileTagFromLesson(lesson) || null,
        primaryPattern: lesson.pattern || null,
        primaryAction: lesson.recommendedAction || null,
        examplePatterns: [],
        exampleActions: [],
        tags: Array.isArray(lesson.tags) ? [...lesson.tags] : [],
        observationIds: new Set(),
        runIds: new Set(),
        topicTags: new Set(),
        sourceStatusCounts: {},
        firstSeen: lesson.timestamp || null,
        lastSeen: lesson.timestamp || null
      });
    }

    const bucket = grouped.get(key);

    if (lesson.timestamp) bucket.observationIds.add(String(lesson.timestamp));
    if (lesson.runId) bucket.runIds.add(String(lesson.runId));

    for (const tag of topicTagsFromLesson(lesson)) {
      bucket.topicTags.add(String(tag));
    }

    if (Array.isArray(lesson.tags)) {
      bucket.tags = [...new Set([...bucket.tags, ...lesson.tags])];
    }

    const sourceStatus = String(lesson.sourceStatus || 'unknown');
    bucket.sourceStatusCounts[sourceStatus] = (bucket.sourceStatusCounts[sourceStatus] || 0) + 1;

    pushUnique(bucket.examplePatterns, lesson.pattern);
    pushUnique(bucket.exampleActions, lesson.recommendedAction);

    if (!bucket.primaryPattern && lesson.pattern) bucket.primaryPattern = lesson.pattern;
    if (!bucket.primaryAction && lesson.recommendedAction) bucket.primaryAction = lesson.recommendedAction;
    if (!bucket.patternLabel && lesson.patternLabel) bucket.patternLabel = lesson.patternLabel;
    if (!bucket.patternCode && lesson.patternCode) bucket.patternCode = lesson.patternCode;

    if (lesson.timestamp && (!bucket.firstSeen || lesson.timestamp < bucket.firstSeen)) {
      bucket.firstSeen = lesson.timestamp;
    }
    if (lesson.timestamp && (!bucket.lastSeen || lesson.timestamp > bucket.lastSeen)) {
      bucket.lastSeen = lesson.timestamp;
    }
  }

  const validatedLessons = [];
  const policyCandidates = [];

  for (const bucket of grouped.values()) {
    const observationCount = bucket.observationIds.size;
    const uniqueRunCount = bucket.runIds.size;
    const uniqueTopicCount = bucket.topicTags.size;

    const normalized = {
      lessonType: bucket.lessonType,
      stage: bucket.stage,
      patternCode: bucket.patternCode,
      patternLabel: bucket.patternLabel,
      pattern: bucket.patternLabel || bucket.primaryPattern || '',
      recommendedAction: bucket.primaryAction || '',
      profileKey: bucket.profileKey,
      examplePatterns: bucket.examplePatterns,
      exampleActions: bucket.exampleActions,
      tags: bucket.tags,
      observationCount,
      uniqueRunCount,
      uniqueTopicCount,
      sourceStatusCounts: bucket.sourceStatusCounts,
      runIds: [...bucket.runIds],
      topicTags: [...bucket.topicTags],
      firstSeen: bucket.firstSeen,
      lastSeen: bucket.lastSeen
    };

    if (observationCount >= validationThreshold) {
      validatedLessons.push({
        ...normalized,
        status: 'validated'
      });
    }

    if (
      observationCount >= policyThreshold &&
      uniqueTopicCount >= policyTopicDiversityThreshold
    ) {
      policyCandidates.push({
        stage: normalized.stage,
        lessonType: normalized.lessonType,
        patternCode: normalized.patternCode,
        patternLabel: normalized.patternLabel,
        pattern: normalized.pattern,
        recommendedAction: normalized.recommendedAction,
        observationCount: normalized.observationCount,
        uniqueRunCount: normalized.uniqueRunCount,
        uniqueTopicCount: normalized.uniqueTopicCount,
        sourceStatusCounts: normalized.sourceStatusCounts,
        profileKey: normalized.profileKey,
        tags: normalized.tags
      });
    }
  }

  validatedLessons.sort((a, b) => {
    if (b.uniqueTopicCount !== a.uniqueTopicCount) return b.uniqueTopicCount - a.uniqueTopicCount;
    if (b.observationCount !== a.observationCount) return b.observationCount - a.observationCount;
    return String(a.patternCode || a.pattern).localeCompare(String(b.patternCode || b.pattern));
  });

  policyCandidates.sort((a, b) => {
    if (b.uniqueTopicCount !== a.uniqueTopicCount) return b.uniqueTopicCount - a.uniqueTopicCount;
    if (b.observationCount !== a.observationCount) return b.observationCount - a.observationCount;
    return String(a.patternCode || a.pattern).localeCompare(String(b.patternCode || b.pattern));
  });

  writeJsonl(validatedFile, validatedLessons);
  writeJson(policyFile, {
    generatedAt: new Date().toISOString(),
    validationThreshold,
    policyThreshold,
    policyTopicDiversityThreshold,
    totalCandidates: candidateLessons.length,
    totalValidated: validatedLessons.length,
    totalPolicyCandidates: policyCandidates.length,
    items: policyCandidates
  });

  return {
    totalCandidates: candidateLessons.length,
    totalValidated: validatedLessons.length,
    totalPolicyCandidates: policyCandidates.length
  };
}

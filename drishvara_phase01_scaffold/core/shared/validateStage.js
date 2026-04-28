import fs from 'node:fs';
import path from 'node:path';

export function loadSchema(schemaPath) {
  const fullPath = path.resolve(schemaPath);

  if (!fs.existsSync(fullPath)) {
    throw new Error(`Schema not found: ${fullPath}`);
  }

  return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
}

export function validateAgainstSchema(data, schema, label = 'stage') {
  const errors = [];

  if (schema.type === 'object') {
    if (typeof data !== 'object' || data === null || Array.isArray(data)) {
      errors.push(`${label}: output must be an object`);
      return { ok: false, errors };
    }
  }

  if (Array.isArray(schema.required)) {
    for (const field of schema.required) {
      if (!(field in data)) {
        errors.push(`${label}: missing required field "${field}"`);
      }
    }
  }

  if (schema.properties && typeof schema.properties === 'object') {
    for (const [key, rule] of Object.entries(schema.properties)) {
      if (!(key in data)) continue;

      const value = data[key];

      if (rule.type === 'string' && typeof value !== 'string') {
        errors.push(`${label}: field "${key}" must be a string`);
      }

      if (rule.type === 'array' && !Array.isArray(value)) {
        errors.push(`${label}: field "${key}" must be an array`);
      }

      if (
        rule.type === 'object' &&
        (typeof value !== 'object' || value === null || Array.isArray(value))
      ) {
        errors.push(`${label}: field "${key}" must be an object`);
      }
    }
  }

  return {
    ok: errors.length === 0,
    errors
  };
}

export function buildContentProfile(input = {}) {
  return {
    topic: String(input.topic || '').trim(),
    contentType: String(input.contentType || '').trim(),
    audience: String(input.audience || '').trim(),
    objective: String(input.objective || '').trim()
  };
}

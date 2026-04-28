export function validateRequired(data, requiredFields = []) {
  const missing = requiredFields.filter((field) => {
    const value = data?.[field];
    return value === undefined || value === null || value === '';
  });

  return {
    ok: missing.length === 0,
    missing
  };
}

export function assertRequired(data, requiredFields, label) {
  const result = validateRequired(data, requiredFields);
  if (!result.ok) {
    throw new Error(`${label} missing required field(s): ${result.missing.join(', ')}`);
  }
}

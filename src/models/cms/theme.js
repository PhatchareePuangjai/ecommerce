function validateTheme(input) {
  const errors = [];
  const out = { ...input };
  if (!out.id) out.id = `THE${Date.now()}`;
  if (!out.name || typeof out.name !== 'string') errors.push('name required');
  if (!out.config) out.config = {};
  return { valid: errors.length === 0, value: out, errors };
}

module.exports = { validateTheme };


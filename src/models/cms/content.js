function validateContent(input) {
  const errors = [];
  const out = { ...input };
  if (!out.id) out.id = `ART${Date.now()}`;
  if (!out.title || typeof out.title !== 'string') errors.push('title required');
  if (!out.body || typeof out.body !== 'string') errors.push('body required');
  if (!out.status) out.status = 'draft';
  if (!['draft', 'review', 'approved', 'published'].includes(out.status)) errors.push('invalid status');
  if (!out.schedule) out.schedule = {};
  if (out.schedule.startAt && isNaN(Date.parse(out.schedule.startAt))) errors.push('schedule.startAt invalid');
  if (out.schedule.endAt && isNaN(Date.parse(out.schedule.endAt))) errors.push('schedule.endAt invalid');
  return { valid: errors.length === 0, value: out, errors };
}

module.exports = { validateContent };


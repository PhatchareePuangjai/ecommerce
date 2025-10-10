function validateBanner(input) {
  const errors = [];
  const out = { ...input };
  if (!out.id) out.id = `BAN${Date.now()}`;
  if (!out.title || typeof out.title !== 'string') errors.push('title required');
  if (!out.mediaUrl || typeof out.mediaUrl !== 'string') errors.push('mediaUrl required');
  if (!out.position || typeof out.position !== 'string') errors.push('position required');
  if (typeof out.order !== 'number') out.order = 0;
  if (!out.status) out.status = 'draft';
  if (!['draft', 'published'].includes(out.status)) errors.push('invalid status');
  if (!out.schedule) out.schedule = {};
  if (out.schedule.startAt && isNaN(Date.parse(out.schedule.startAt))) errors.push('schedule.startAt invalid');
  if (out.schedule.endAt && isNaN(Date.parse(out.schedule.endAt))) errors.push('schedule.endAt invalid');
  return { valid: errors.length === 0, value: out, errors };
}

module.exports = { validateBanner };


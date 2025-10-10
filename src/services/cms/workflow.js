function canTransition(from, action) {
  const map = {
    draft: { submit: 'review', publish: null, approve: null, unpublish: null },
    review: { approve: 'approved', submit: null, publish: null, unpublish: null },
    approved: { publish: 'published', approve: null, submit: null, unpublish: null },
    published: { unpublish: 'draft', publish: null, approve: null, submit: null },
  };
  const next = (map[from] || {})[action] || null;
  return next;
}

function transition(content, action, actor = 'system', at = new Date()) {
  const from = content.status;
  const next = canTransition(from, action);
  if (!next) throw new Error(`invalid transition: ${from} -> (${action})`);
  const updated = { ...content, status: next };
  if (action === 'publish') updated.publishedAt = new Date(at).toISOString();
  if (action === 'unpublish') updated.publishedAt = null;
  const entry = { at: new Date(at).toISOString(), actor, action, from, to: next };
  updated.audit = Array.isArray(content.audit) ? [...content.audit, entry] : [entry];
  return updated;
}

module.exports = { canTransition, transition };


function requirePreviewRole(roles = ['admin']) {
  return function (req, res, next) {
    const role = (req.headers['x-preview-role'] || '').toString();
    if (!role || !roles.includes(role)) {
      return res.status(403).json({ error: 'Forbidden: preview role required' });
    }
    next();
  };
}

module.exports = { requirePreviewRole };

const express = require('express');
const { requirePreviewRole } = require('../../../services/cms/previewAuth');
const { getArticle, getBanner } = require('../../../services/cms/store');
const router = express.Router();

router.get('/:type/:id', requirePreviewRole(), async (req, res) => {
  const { type, id } = req.params;
  if (!['article', 'banner'].includes(type)) return res.status(400).json({ error: 'invalid type' });
  const item = type === 'article' ? getArticle(id) : getBanner(id);
  if (!item) return res.status(404).json({ error: 'Not found' });
  return res.json({ type, item });
});

module.exports = { router };

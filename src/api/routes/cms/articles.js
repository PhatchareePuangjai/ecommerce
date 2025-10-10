const express = require('express');
const router = express.Router();
const {
  createArticle,
  listPublishedArticles,
  updateArticle,
  articleAction,
  getArticle,
} = require('../../../services/cms/store');

router.get('/', async (req, res) => {
  const items = listPublishedArticles(new Date());
  return res.status(200).json({ items });
});

router.post('/', async (req, res) => {
  try {
    const created = createArticle(req.body || {});
    return res.status(201).json(created);
  } catch (e) {
    return res.status(400).json({ error: 'Invalid article', details: e.details || [e.message] });
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { action, ...patch } = req.body || {};
  const exists = getArticle(id);
  if (!exists) return res.status(404).json({ error: 'Not found' });
  try {
    let updated = exists;
    if (action) {
      updated = articleAction(id, action, 'api');
    }
    if (Object.keys(patch).length) {
      updated = updateArticle(id, { ...updated, ...patch });
    }
    return res.json(updated);
  } catch (e) {
    return res.status(400).json({ error: 'Invalid update', details: e.details || [e.message] });
  }
});

module.exports = { router };

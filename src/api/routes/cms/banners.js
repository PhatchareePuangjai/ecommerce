const express = require('express');
const router = express.Router();
const {
  listVisibleBanners,
  createBanner,
  getBanner,
  updateBanner,
  bannerAction,
} = require('../../../services/cms/store');

router.get('/', async (req, res) => {
  const items = listVisibleBanners(new Date());
  return res.status(200).json({ items });
});

router.post('/', async (req, res) => {
  try {
    const created = createBanner(req.body || {});
    return res.status(201).json(created);
  } catch (e) {
    return res.status(400).json({ error: 'Invalid banner', details: e.details || [e.message] });
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { action, ...patch } = req.body || {};
  const exists = getBanner(id);
  if (!exists) return res.status(404).json({ error: 'Not found' });
  try {
    let updated = exists;
    if (action) {
      updated = bannerAction(id, action, 'api');
    }
    if (Object.keys(patch).length) {
      updated = updateBanner(id, { ...updated, ...patch });
    }
    return res.json(updated);
  } catch (e) {
    return res.status(400).json({ error: 'Invalid update', details: e.details || [e.message] });
  }
});

module.exports = { router };

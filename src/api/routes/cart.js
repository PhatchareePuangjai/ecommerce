const express = require('express');
const router = express.Router();

const { canAddToCart } = require('../../services/inventory');

router.post('/', async (req, res) => {
  const { skuId, quantity } = req.body || {};
  const check = await canAddToCart(skuId, Number(quantity));
  if (!check.ok) return res.status(409).json({ error: check.reason });
  return res.status(201).json({ added: true });
});

module.exports = { router };


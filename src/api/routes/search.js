const express = require('express');
const router = express.Router();

// Mock catalog for demonstration
const catalog = [
  { id: 'P1', name: 'Tee', price: 20, skuId: 'SKU123', discontinued: false },
  { id: 'P2', name: 'Hat', price: 15, skuId: 'SKU-LOW', discontinued: false },
];

const { availableToSell } = require('../../services/inventory');

router.get('/', async (req, res) => {
  const q = (req.query.q || '').toString().toLowerCase();
  let items = catalog.filter((p) => !p.discontinued);
  if (q) items = items.filter((p) => p.name.toLowerCase().includes(q));

  const withStock = await Promise.all(
    items.map(async (p) => {
      const ats = await availableToSell(p.skuId);
      const inStock = ats > 0;
      return {
        id: p.id,
        name: p.name,
        price: p.price,
        inStock,
        stockLabel: inStock ? undefined : 'Out of stock',
      };
    })
  );

  res.json({ items: withStock });
});

module.exports = { router };


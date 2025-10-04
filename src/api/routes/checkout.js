const express = require('express');
const router = express.Router();

const { validateAddress } = require('../../services/addressValidation');
const { reserve, decrementOnCapture } = require('../../services/inventory');
const { processPayment } = require('../../services/payment');
const { handoffConfirmation } = require('../../services/notifications');
const { query } = require('../../db');

router.post('/', async (req, res) => {
  try {
    const { shippingAddress, paymentMethod, items = [], totals = { total: 0, currency: 'USD' } } = req.body || {};
    await validateAddress(shippingAddress);
    // Reserve all items
    for (const it of items) {
      await reserve(it.skuId, it.quantity);
    }
    const payRes = await processPayment(paymentMethod, totals);
    // Persist order
    const insertOrder = await query(
      'INSERT INTO orders (email, shipping_address, totals_total, totals_currency, payment_status) VALUES ($1,$2,$3,$4,$5) RETURNING id',
      [req.body?.email || null, JSON.stringify(shippingAddress), totals?.total || 0, totals?.currency || 'USD', payRes.status]
    );
    const orderId = insertOrder.rows[0].id;
    // Capture (decrement) after payment capture/authorization (simplified)
    for (const it of items) {
      await decrementOnCapture(it.skuId, it.quantity);
      await query(
        'INSERT INTO order_items (order_id, sku_id, quantity, unit_price) VALUES ($1,$2,$3,$4)',
        [orderId, it.skuId, it.quantity, Number(totals?.total || 0)]
      );
    }
    await handoffConfirmation({ orderId, email: req.body?.email });
    return res.status(201).json({ orderCreated: true, orderId, payment: payRes });
  } catch (e) {
    if (/validation/i.test(String(e.message))) return res.status(422).json({ error: e.message });
    return res.status(400).json({ error: e.message });
  }
});

module.exports = { router };

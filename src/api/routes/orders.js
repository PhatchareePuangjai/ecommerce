const express = require('express');
const router = express.Router();

const { query } = require('../../db');

// List recent orders with pagination
router.get('/', async (req, res) => {
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
  const offset = Math.max(parseInt(req.query.offset, 10) || 0, 0);

  const where = [];
  const params = [];
  let idx = 1;

  if (req.query.email) {
    where.push(`email ILIKE $${idx++}`);
    params.push(`%${req.query.email}%`);
  }
  if (req.query.payment_status) {
    where.push(`payment_status = $${idx++}`);
    params.push(String(req.query.payment_status));
  }
  if (req.query.from) {
    where.push(`created_at >= $${idx++}`);
    params.push(new Date(req.query.from));
  }
  if (req.query.to) {
    where.push(`created_at <= $${idx++}`);
    params.push(new Date(req.query.to));
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const sql = `SELECT * FROM orders ${whereSql} ORDER BY created_at DESC LIMIT $${idx++} OFFSET $${idx}`;
  params.push(limit, offset);

  const rows = await query(sql, params);
  return res.json({ orders: rows.rows, limit, offset, filters: {
    email: req.query.email || null,
    payment_status: req.query.payment_status || null,
    from: req.query.from || null,
    to: req.query.to || null,
  } });
});

router.get('/:orderId', async (req, res) => {
  const { orderId } = req.params;
  if (!orderId) return res.status(404).end();
  const order = await query('SELECT * FROM orders WHERE id = $1', [orderId]);
  if (order.rowCount === 0) return res.status(404).json({ error: 'Not found' });
  const items = await query('SELECT * FROM order_items WHERE order_id = $1', [orderId]);
  return res.json({ order: order.rows[0], items: items.rows });
});

module.exports = { router };

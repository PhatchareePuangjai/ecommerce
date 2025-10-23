// Lightweight in-memory adapter for tests to avoid requiring a real Postgres
// Prefer in-memory DB when running under Jest or NODE_ENV=test
if (process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID !== undefined) {
  const memory = { orders: [], order_items: [] };
  async function query(text, params = []) {
    const sql = String(text).trim().toLowerCase();
    if (sql.startsWith('insert into orders')) {
      const id = memory.orders.length + 1;
      memory.orders.push({
        id,
        email: params[0] || null,
        shipping_address: params[1] || null,
        totals_total: params[2] || 0,
        totals_currency: params[3] || 'USD',
        payment_status: params[4] || 'succeeded',
      });
      return { rows: [{ id }] };
    }
    if (sql.startsWith('insert into order_items')) {
      memory.order_items.push({
        order_id: params[0],
        sku_id: params[1],
        quantity: params[2],
        unit_price: params[3],
      });
      return { rows: [] };
    }
    // Default no-op for other statements in tests
    return { rows: [] };
  }
  module.exports = { pool: null, query, __memory: memory };
} else {
  const { Pool } = require('pg');

  const config = {
    host: process.env.PGHOST || '127.0.0.1',
    port: Number(process.env.PGPORT || 5432),
    database: process.env.PGDATABASE || 'ecommerce',
    user: process.env.PGUSER || 'ecommerce',
    password: process.env.PGPASSWORD || 'ecommerce',
    max: 10,
    idleTimeoutMillis: 30000,
  };

  const pool = new Pool(config);

  async function query(text, params) {
    const client = await pool.connect();
    try {
      const res = await client.query(text, params);
      return res;
    } finally {
      client.release();
    }
  }

  module.exports = { pool, query };
}

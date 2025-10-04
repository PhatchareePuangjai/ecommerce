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


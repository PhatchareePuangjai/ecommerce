// Lightweight in-memory adapter for tests to avoid requiring a real Postgres
// Prefer in-memory DB when running under Jest or NODE_ENV=test
if (process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID !== undefined) {
  const memory = {
    orders: [],
    order_items: [],
    auth_users: [],
    auth_addresses: [],
    auth_verification_tokens: [],
    auth_reset_tokens: [],
    auth_sessions: []
  };

  function clone(row) {
    return row ? JSON.parse(JSON.stringify(row)) : row;
  }

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
    if (sql.startsWith('insert into auth_users')) {
      const [
        id,
        email,
        passwordHash,
        firstName,
        lastName,
        isVerified,
        verificationIssuedAt,
        lockedUntil,
        failedLoginCount,
        defaultPaymentTokenId,
        createdAt,
        updatedAt
      ] = params;
      if (memory.auth_users.find((u) => u.email === email)) {
        const err = new Error('duplicate key value violates unique constraint "auth_users_email_key"');
        err.code = '23505';
        throw err;
      }
      const row = {
        id,
        email,
        password_hash: passwordHash,
        first_name: firstName,
        last_name: lastName,
        is_verified: isVerified,
        verification_issued_at: verificationIssuedAt.toISOString(),
        locked_until: lockedUntil ? lockedUntil.toISOString() : null,
        failed_login_count: failedLoginCount,
        default_payment_token_id: defaultPaymentTokenId,
        created_at: createdAt.toISOString(),
        updated_at: updatedAt.toISOString()
      };
      memory.auth_users.push(row);
      return { rows: [clone(row)] };
    }
    if (sql.startsWith('select * from auth_users where email')) {
      const email = params[0];
      const row = memory.auth_users.find((u) => u.email === email) || null;
      return { rows: row ? [clone(row)] : [] };
    }
    if (sql.startsWith('select * from auth_users where id')) {
      const id = params[0];
      const row = memory.auth_users.find((u) => u.id === id) || null;
      return { rows: row ? [clone(row)] : [] };
    }
    if (sql.startsWith('update auth_users set is_verified')) {
      const [id, isVerified, verificationIssuedAt, updatedAtParam] = params;
      const updatedAt = updatedAtParam || verificationIssuedAt;
      const row = memory.auth_users.find((u) => u.id === id);
      if (!row) return { rows: [] };
      row.is_verified = isVerified;
      row.verification_issued_at = verificationIssuedAt.toISOString();
      row.updated_at = updatedAt.toISOString();
      return { rows: [clone(row)] };
    }
    if (sql.startsWith('update auth_users set failed_login_count')) {
      const [id, failedLoginCount, lockedUntil, updatedAt] = params;
      const row = memory.auth_users.find((u) => u.id === id);
      if (!row) return { rows: [] };
      row.failed_login_count = failedLoginCount;
      row.locked_until = lockedUntil ? lockedUntil.toISOString() : null;
      row.updated_at = updatedAt.toISOString();
      return { rows: [clone(row)] };
    }
    if (sql.startsWith('update auth_users') && sql.includes('set first_name')) {
      const [id, firstName, lastName, defaultPaymentTokenId, updatedAt] = params;
      const row = memory.auth_users.find((u) => u.id === id);
      if (!row) return { rows: [] };
      row.first_name = firstName;
      row.last_name = lastName;
      row.default_payment_token_id =
        defaultPaymentTokenId === undefined ? row.default_payment_token_id : defaultPaymentTokenId;
      row.updated_at = updatedAt.toISOString();
      return { rows: [clone(row)] };
    }
    if (sql.startsWith('update auth_users') && sql.includes('set password_hash')) {
      const [id, passwordHash, updatedAt] = params;
      const row = memory.auth_users.find((u) => u.id === id);
      if (!row) return { rows: [] };
      row.password_hash = passwordHash;
      row.updated_at = updatedAt.toISOString();
      row.failed_login_count = 0;
      row.locked_until = null;
      return { rows: [clone(row)] };
    }
    if (sql.startsWith('delete from auth_verification_tokens where user_id')) {
      const userId = params[0];
      memory.auth_verification_tokens = memory.auth_verification_tokens.filter((t) => t.user_id !== userId);
      return { rows: [] };
    }
    if (sql.startsWith('insert into auth_verification_tokens')) {
      const [id, userId, token, issuedAt, expiresAt, consumedAt] = params;
      const row = {
        id,
        user_id: userId,
        token,
        issued_at: issuedAt.toISOString(),
        expires_at: expiresAt.toISOString(),
        consumed_at: consumedAt ? consumedAt.toISOString() : null
      };
      memory.auth_verification_tokens.push(row);
      return { rows: [clone(row)] };
    }
    if (sql.startsWith('select * from auth_verification_tokens where token')) {
      const token = params[0];
      const row = memory.auth_verification_tokens.find((t) => t.token === token) || null;
      return { rows: row ? [clone(row)] : [] };
    }
    if (sql.startsWith('update auth_verification_tokens set consumed_at')) {
      const [id, consumedAt] = params;
      const row = memory.auth_verification_tokens.find((t) => t.id === id);
      if (!row) return { rows: [] };
      row.consumed_at = consumedAt.toISOString();
      return { rows: [clone(row)] };
    }
    if (sql.startsWith('delete from auth_verification_tokens where id')) {
      const id = params[0];
      memory.auth_verification_tokens = memory.auth_verification_tokens.filter((t) => t.id !== id);
      return { rows: [] };
    }
    if (sql.startsWith('delete from auth_reset_tokens where user_id')) {
      const userId = params[0];
      memory.auth_reset_tokens = memory.auth_reset_tokens.filter((t) => t.user_id !== userId);
      return { rows: [] };
    }
    if (sql.startsWith('insert into auth_reset_tokens')) {
      const [id, userId, token, issuedAt, expiresAt, consumedAt] = params;
      const row = {
        id,
        user_id: userId,
        token,
        issued_at: issuedAt.toISOString(),
        expires_at: expiresAt.toISOString(),
        consumed_at: consumedAt ? consumedAt.toISOString() : null
      };
      memory.auth_reset_tokens.push(row);
      return { rows: [clone(row)] };
    }
    if (sql.startsWith('select * from auth_reset_tokens where token')) {
      const token = params[0];
      const row = memory.auth_reset_tokens.find((t) => t.token === token) || null;
      return { rows: row ? [clone(row)] : [] };
    }
    if (sql.startsWith('update auth_reset_tokens set consumed_at')) {
      const [id, consumedAt] = params;
      const row = memory.auth_reset_tokens.find((t) => t.id === id);
      if (!row) return { rows: [] };
      row.consumed_at = consumedAt.toISOString();
      return { rows: [clone(row)] };
    }
    if (sql.startsWith('delete from auth_reset_tokens where id')) {
      const id = params[0];
      memory.auth_reset_tokens = memory.auth_reset_tokens.filter((t) => t.id !== id);
      return { rows: [] };
    }
    if (sql.startsWith('select * from auth_addresses where user_id')) {
      const userId = params[0];
      const rows = memory.auth_addresses.filter((a) => a.user_id === userId);
      return { rows: rows.map(clone) };
    }
    if (sql.startsWith('update auth_addresses set is_default_shipping = false')) {
      const userId = params[0];
      memory.auth_addresses = memory.auth_addresses.map((a) =>
        a.user_id === userId ? { ...a, is_default_shipping: false } : a
      );
      return { rows: [] };
    }
    if (sql.startsWith('insert into auth_addresses')) {
      const [
        id,
        userId,
        label,
        recipient,
        line1,
        line2,
        city,
        state,
        postalCode,
        country,
        phone,
        isDefaultShipping,
        createdAt,
        updatedAt
      ] = params;
      const row = {
        id,
        user_id: userId,
        label,
        recipient,
        line1,
        line2,
        city,
        state,
        postal_code: postalCode,
        country,
        phone,
        is_default_shipping: isDefaultShipping,
        created_at: createdAt.toISOString(),
        updated_at: updatedAt.toISOString()
      };
      memory.auth_addresses.push(row);
      return { rows: [clone(row)] };
    }
    if (sql.startsWith('delete from auth_addresses where user_id')) {
      const [userId, addressId] = params;
      const before = memory.auth_addresses.length;
      memory.auth_addresses = memory.auth_addresses.filter((a) => !(a.user_id === userId && a.id === addressId));
      return { rowCount: before !== memory.auth_addresses.length ? 1 : 0, rows: [] };
    }
    if (sql.startsWith('insert into auth_sessions')) {
      const [id, userId, jwtId, issuedAt, expiresAt, revokedAt, userAgent, ip] = params;
      const row = {
        id,
        user_id: userId,
        jwt_id: jwtId,
        issued_at: issuedAt.toISOString(),
        expires_at: expiresAt.toISOString(),
        revoked_at: revokedAt ? revokedAt.toISOString() : null,
        user_agent: userAgent,
        ip
      };
      memory.auth_sessions.push(row);
      return { rows: [clone(row)] };
    }
    if (sql.startsWith('select * from auth_sessions where jwt_id')) {
      const token = params[0];
      const row = memory.auth_sessions.find((s) => s.jwt_id === token) || null;
      return { rows: row ? [clone(row)] : [] };
    }
    if (sql.startsWith('update auth_sessions set revoked_at')) {
      const [token, revokedAt] = params;
      const row = memory.auth_sessions.find((s) => s.jwt_id === token);
      if (!row || row.revoked_at) {
        return { rowCount: 0, rows: [] };
      }
      row.revoked_at = revokedAt.toISOString();
      return { rowCount: 1, rows: [clone(row)] };
    }
    // Default no-op for other statements in tests
    return { rows: [] };
  }
  module.exports = {
    pool: null,
    query,
    __memory: memory,
    __resetAuth() {
      memory.auth_users = [];
      memory.auth_addresses = [];
      memory.auth_verification_tokens = [];
      memory.auth_reset_tokens = [];
      memory.auth_sessions = [];
    }
  };
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

const fs = require('fs');
const path = require('path');
const { query } = require('./index');

async function run() {
  const dir = path.resolve(__dirname, '../../db/migrations');
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();
  for (const f of files) {
    const p = path.join(dir, f);
    const sql = fs.readFileSync(p, 'utf8');
    // split on semicolons that terminate statements (simple split)
    const statements = sql
      .split(/;\s*\n/g)
      .map((s) => s.trim())
      .filter(Boolean);
    for (const stmt of statements) {
      await query(stmt);
    }
    // eslint-disable-next-line no-console
    console.log(`Applied migration: ${f}`);
  }
}

run().then(() => {
  // eslint-disable-next-line no-console
  console.log('Migrations complete');
  process.exit(0);
}).catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Migration failed', err);
  process.exit(1);
});


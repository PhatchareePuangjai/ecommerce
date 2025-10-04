-- Orders and order_items schema
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  email TEXT,
  shipping_address JSONB,
  totals_total NUMERIC(12,2),
  totals_currency TEXT,
  payment_status TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  sku_id TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(12,2)
);


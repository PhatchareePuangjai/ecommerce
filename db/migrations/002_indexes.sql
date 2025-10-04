-- Performance indexes for orders and order_items
-- Enable trigram extension for efficient ILIKE/substring search on email
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Orders indexes
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders (payment_status);
-- Trigram GIN index for case-insensitive substring matches on email
CREATE INDEX IF NOT EXISTS idx_orders_email_trgm ON orders USING GIN (email gin_trgm_ops);

-- Order items lookup by order id
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items (order_id);


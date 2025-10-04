// In-memory mock inventory state for TDD scaffolding
const stock = new Map();
const reservations = new Map();

function getStock(skuId) {
  if (!stock.has(skuId)) {
    // Seed some defaults
    stock.set(skuId, skuId === 'SKU-LOW' ? 0 : 10);
  }
  return stock.get(skuId);
}

function getReserved(skuId) {
  return reservations.get(skuId) || 0;
}

async function reserve(skuId, qty) {
  const available = getStock(skuId) - getReserved(skuId);
  if (qty <= 0 || qty > available) throw new Error('Insufficient available stock to reserve');
  reservations.set(skuId, getReserved(skuId) + qty);
  return true;
}

async function decrementOnCapture(skuId, qty) {
  const res = getReserved(skuId);
  if (qty > res) throw new Error('Capture exceeds reserved');
  reservations.set(skuId, res - qty);
  stock.set(skuId, getStock(skuId) - qty);
  return true;
}

async function availableToSell(skuId) {
  return Math.max(0, getStock(skuId) - getReserved(skuId));
}

async function canAddToCart(skuId, qty) {
  const ats = await availableToSell(skuId);
  if (qty <= 0) return { ok: false, reason: 'Invalid quantity' };
  if (qty > ats) return { ok: false, reason: 'Insufficient stock availability' };
  return { ok: true };
}

module.exports = { reserve, decrementOnCapture, availableToSell, canAddToCart };


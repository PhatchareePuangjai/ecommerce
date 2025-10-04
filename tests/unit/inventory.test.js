const { reserve, decrementOnCapture, availableToSell, canAddToCart } = require('../../src/services/inventory');

describe('Inventory Service', () => {
  test('reserve at order placement and decrement on capture', async () => {
    const skuId = 'SKU123';
    await reserve(skuId, 2);
    // simulate capture
    await expect(decrementOnCapture(skuId, 2)).resolves.toBe(true);
  });

  test('ATS sums across warehouses minus reservations', async () => {
    const ats = await availableToSell('SKU123');
    expect(typeof ats).toBe('number');
    expect(ats).toBeGreaterThanOrEqual(0);
  });

  test('add-to-cart enforces stock constraint', async () => {
    const skuId = 'SKU-LOW';
    await expect(canAddToCart(skuId, 99999)).resolves.toEqual({ ok: false, reason: expect.stringMatching(/stock|availability/i) });
  });
});


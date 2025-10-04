const { processPayment } = require('../../src/services/payment');

describe('Payment Service (Stripe single option)', () => {
  test('processes express wallet tokens where eligible', async () => {
    const result = await processPayment({ provider: 'stripe', token: 'tok_applepay_123' }, { total: 100, currency: 'USD' });
    expect(result).toEqual(expect.objectContaining({ provider: 'stripe', providerRef: expect.any(String), status: 'authorized' }));
  });

  test('processes card tokens otherwise', async () => {
    const result = await processPayment({ provider: 'stripe', token: 'tok_card_123' }, { total: 50, currency: 'USD' });
    expect(result.status).toMatch(/authorized|captured/);
  });
});


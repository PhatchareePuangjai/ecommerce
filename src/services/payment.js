function mockStripeAuthorize(token, amount, currency) {
  // Simulate different flows based on token prefix
  const isExpress = /^tok_(applepay|googlepay)/i.test(token);
  const providerRef = `pi_${Math.random().toString(36).slice(2, 10)}`;
  return {
    provider: 'stripe',
    providerRef,
    status: isExpress ? 'authorized' : 'captured',
    amount,
    currency,
  };
}

async function processPayment(method, orderTotals) {
  if (!method || method.provider !== 'stripe' || !method.token) {
    throw new Error('Unsupported payment method');
  }
  const amount = orderTotals?.total ?? 0;
  const currency = orderTotals?.currency ?? 'USD';
  return mockStripeAuthorize(method.token, amount, currency);
}

module.exports = { processPayment };


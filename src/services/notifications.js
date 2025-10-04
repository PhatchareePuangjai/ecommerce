async function handoffConfirmation(payload) {
  if (!payload || !payload.orderId) throw new Error('Invalid payload');
  // Simulate provider handoff
  return { handedOff: true, provider: 'email', at: new Date() };
}

module.exports = { handoffConfirmation };


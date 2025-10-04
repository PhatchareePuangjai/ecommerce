const { handoffConfirmation } = require('../../src/services/notifications');

describe('Notification Handoff Service', () => {
  test('hands off confirmation payload to provider', async () => {
    const res = await handoffConfirmation({ orderId: 'ORDER1', email: 'a@b.com' });
    expect(res).toEqual(expect.objectContaining({ handedOff: true, provider: expect.any(String), at: expect.any(Date) }));
  });
});


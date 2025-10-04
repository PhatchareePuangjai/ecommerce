const { validateAddress } = require('../../src/services/addressValidation');

describe('Address Validation Service', () => {
  test('rejects invalid/mismatched postal address', async () => {
    const bad = { line1: '123 Fake', city: 'X', region: 'YY', postalCode: '00000', country: 'US' };
    await expect(validateAddress(bad)).rejects.toThrow(/validation/i);
  });

  test('accepts valid address', async () => {
    const good = { line1: '1 Market St', city: 'San Francisco', region: 'CA', postalCode: '94105', country: 'US' };
    await expect(validateAddress(good)).resolves.toEqual(expect.objectContaining({ valid: true }));
  });
});

